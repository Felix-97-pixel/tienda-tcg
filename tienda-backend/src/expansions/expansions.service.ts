import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MagicService } from '../sync/magic.service';
import { PokemonService } from '../sync/pokemon.service';
import { RiftboundService } from '../sync/riftbound.service';

@Injectable()
export class ExpansionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly magicService: MagicService,
    private readonly pokemonService: PokemonService,
    private readonly riftboundService: RiftboundService
  ) {}

  async getExpansions(page: number = 1, limit: number = 50, game?: string, search?: string) {
    const where: any = {};
    if (game && game !== 'all') {
      where.game = { equals: game, mode: 'insensitive' };
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const total = await this.prisma.expansion.count({ where });
    const expansions = await this.prisma.expansion.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { cardDetails: true }
        }
      }
    });

    return {
      data: expansions.map(e => ({
        id: e.id,
        externalId: e.externalId,
        name: e.name,
        game: e.game,
        productsCount: e._count.cardDetails,
        releaseDate: e.releaseDate
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateExpansion(id: string, data: { externalId?: string; name?: string }) {
    const expansion = await this.prisma.expansion.findUnique({ where: { id } });
    if (!expansion) throw new NotFoundException('Expansión no encontrada');

    return this.prisma.expansion.update({
      where: { id },
      data
    });
  }

  async getRemoteSets(game: string) {
    const g = game.toLowerCase();
    let sets = [];

    if (g === 'magic') {
      const scryfallSets = await this.magicService.fetchScryfallSets();
      sets = scryfallSets.map(s => ({
        id: s.code.toUpperCase(),
        name: s.name,
        releaseDate: s.released_at
      }));
    } else if (g === 'pokemon') {
      const pokemonSets = await this.pokemonService.fetchSets();
      sets = pokemonSets.map(s => ({
        id: s.id,
        name: s.name,
        releaseDate: s.releaseDate
      }));
    } else if (g === 'riftbound') {
      const apiKey = process.env.JUSTTCG_API_KEY;
      if (!apiKey) throw new Error('JUSTTCG_API_KEY not configured');
      const justTcgSets = await this.riftboundService.fetchJustTcgSets(apiKey);
      sets = justTcgSets.map(s => ({
        id: s.set_id || s.slug || s.id,
        name: s.name,
        releaseDate: s.release_date
      }));
    } else {
      throw new Error(`Juego no soportado para remote sets: ${game}`);
    }

    // Sort by name
    return sets.sort((a, b) => a.name.localeCompare(b.name));
  }

  async autoMapGameExpansions(game: string) {
    // 1. Fetch unmapped local expansions for this game
    const unmapped = await this.prisma.expansion.findMany({
      where: {
        game: { equals: game, mode: 'insensitive' },
        OR: [
          { externalId: null },
          { externalId: '' }
        ]
      }
    });

    if (unmapped.length === 0) {
      return { mapped: 0, remaining: 0, details: [] };
    }

    // 2. Fetch remote sets
    let remoteSets = [];
    try {
      remoteSets = await this.getRemoteSets(game);
    } catch (e) {
      throw new Error(`No se pudieron obtener los sets remotos para el juego ${game}`);
    }

    // 3. Match and Update
    let mappedCount = 0;
    const details = [];

    for (const local of unmapped) {
      const localNameClean = local.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Attempt exact match or substring match
      const match = remoteSets.find(s => {
        const remoteNameClean = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return remoteNameClean === localNameClean || remoteNameClean.includes(localNameClean) || localNameClean.includes(remoteNameClean);
      });

      if (match) {
        await this.prisma.expansion.update({
          where: { id: local.id },
          data: { externalId: match.id }
        });
        mappedCount++;
        details.push({ localName: local.name, remoteName: match.name, status: 'mapped' });
      } else {
        details.push({ localName: local.name, remoteName: null, status: 'unmapped' });
      }
    }

    return {
      mapped: mappedCount,
      remaining: unmapped.length - mappedCount,
      details
    };
  }
}

