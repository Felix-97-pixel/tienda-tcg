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

  async getExpansions(page: number = 1, limit: number = 50, gameId?: string, search?: string) {
    const where: any = {};
    if (gameId && gameId !== 'all') {
      where.gameId = gameId;
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
        gameRel: true,
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
        game: e.gameRel?.name,
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

    // If updating externalId, check if another expansion already has it for the same game
    if (data.externalId) {
      const conflict = await this.prisma.expansion.findFirst({
        where: {
          externalId: data.externalId,
          gameId: expansion.gameId,
          id: { not: id } // Exclude the current expansion
        }
      });

      if (conflict) {
        // Remove the externalId from the conflicting expansion
        await this.prisma.expansion.update({
          where: { id: conflict.id },
          data: { externalId: null }
        });
      }
    }

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
    // 1. Fetch remote sets
    let remoteSets = [];
    try {
      remoteSets = await this.getRemoteSets(game);
    } catch (e) {
      throw new Error(`No se pudieron obtener los sets remotos para el juego ${game}`);
    }

    // 2. Fix wrongly mapped promos: if a "Promos" expansion stole a base set's code, unmap it
    const allMapped = await this.prisma.expansion.findMany({
      where: {
        gameRel: { name: { equals: game, mode: 'insensitive' } },
        externalId: { not: null }
      },
      include: { _count: { select: { cardDetails: true } } }
    });

    for (const mapped of allMapped) {
      const isLocalPromo = /promo/i.test(mapped.name);
      const remoteMatch = remoteSets.find(r => r.id === mapped.externalId);
      if (!remoteMatch) continue;
      
      const isRemotePromo = /promo/i.test(remoteMatch.name);
      
      // If local is "Promos" but remote is NOT a promo set → wrong mapping
      if (isLocalPromo && !isRemotePromo) {
        await this.prisma.expansion.update({
          where: { id: mapped.id },
          data: { externalId: null }
        });
      }
    }

    // 3. Fetch ALL unmapped expansions (including ones we just unmapped)
    const unmapped = await this.prisma.expansion.findMany({
      where: {
        gameRel: { name: { equals: game, mode: 'insensitive' } },
        OR: [
          { externalId: null },
          { externalId: '' }
        ]
      },
      include: { _count: { select: { cardDetails: true } } }
    });

    if (unmapped.length === 0) {
      return { mapped: 0, remaining: 0, details: [] };
    }

    // 4. Sort by card count DESC → main sets get mapped first
    unmapped.sort((a, b) => b._count.cardDetails - a._count.cardDetails);

    // 5. Collect already-used externalIds
    const alreadyMapped2 = await this.prisma.expansion.findMany({
      where: {
        gameRel: { name: { equals: game, mode: 'insensitive' } },
        externalId: { not: null }
      },
      select: { externalId: true }
    });
    const usedExternalIds = new Set(alreadyMapped2.map(e => e.externalId));

    // 6. Match and Update
    let mappedCount = 0;
    const details = [];

    for (const local of unmapped) {
      const localNameClean = this.normalizeExpansionName(local.name);
      const isLocalPromo = /promo/i.test(local.name);
      
      // Find best match by similarity score
      let bestMatch = null;
      let bestScore = 0;

      for (const remote of remoteSets) {
        if (usedExternalIds.has(remote.id)) continue; // Skip already used

        const remoteNameClean = this.normalizeExpansionName(remote.name);
        const isRemotePromo = /promo/i.test(remote.name);
        
        // Penalize promo/non-promo mismatches heavily
        if (isLocalPromo !== isRemotePromo) continue;

        // Exact match after normalization
        if (remoteNameClean === localNameClean) {
          bestMatch = remote;
          bestScore = 1;
          break;
        }

        // Calculate similarity score
        const score = this.calculateSimilarity(localNameClean, remoteNameClean);
        if (score > bestScore && score >= 0.70) {
          bestScore = score;
          bestMatch = remote;
        }
      }

      if (bestMatch) {
        try {
          await this.prisma.expansion.update({
            where: { id: local.id },
            data: { externalId: bestMatch.id }
          });
          usedExternalIds.add(bestMatch.id);
          mappedCount++;
          details.push({ localName: local.name, remoteName: bestMatch.name, status: 'mapped' });
        } catch (e) {
          details.push({ localName: local.name, remoteName: bestMatch.name, status: 'error' });
        }
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

  /**
   * Normaliza nombres de expansión para mejorar el matching.
   * Ej: "10th Edition" → "tenth edition", "Magic: The Gathering—Foundations" → "foundations"
   */
  private normalizeExpansionName(name: string): string {
    let n = name.toLowerCase();
    
    // Remover prefijos comunes
    n = n.replace(/^magic:\s*the\s*gathering[\s—–-]*/i, '');
    n = n.replace(/^mtg\s*/i, '');
    
    // Normalizar números ordinales
    n = n.replace(/\b1st\b/g, 'first');
    n = n.replace(/\b2nd\b/g, 'second');
    n = n.replace(/\b3rd\b/g, 'third');
    n = n.replace(/\b4th\b/g, 'fourth');
    n = n.replace(/\b5th\b/g, 'fifth');
    n = n.replace(/\b6th\b/g, 'sixth');
    n = n.replace(/\b7th\b/g, 'seventh');
    n = n.replace(/\b8th\b/g, 'eighth');
    n = n.replace(/\b9th\b/g, 'ninth');
    n = n.replace(/\b10th\b/g, 'tenth');
    
    // Remover caracteres especiales pero conservar espacios
    n = n.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    
    return n;
  }

  /**
   * Calcula similitud entre dos strings usando coeficiente de Dice (bigrams).
   */
  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    const getBigrams = (str: string) => {
      const bigrams = new Map<string, number>();
      for (let i = 0; i < str.length - 1; i++) {
        const bigram = str.substring(i, i + 2);
        bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
      }
      return bigrams;
    };

    const bigramsA = getBigrams(a);
    const bigramsB = getBigrams(b);
    
    let intersection = 0;
    for (const [bigram, count] of bigramsA) {
      if (bigramsB.has(bigram)) {
        intersection += Math.min(count, bigramsB.get(bigram)!);
      }
    }

    return (2.0 * intersection) / (a.length - 1 + b.length - 1);
  }
}

