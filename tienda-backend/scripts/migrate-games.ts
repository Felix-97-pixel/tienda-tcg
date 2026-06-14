import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting games migration...');

  // 1. Find all distinct game names from Expansions
  const distinctGames = await prisma.expansion.groupBy({
    by: ['game'],
  });

  const gamesToCreate = distinctGames.map(d => d.game).filter(Boolean);
  console.log(`Found ${gamesToCreate.length} distinct games to migrate:`, gamesToCreate);

  // 2. Create Game records
  const gameMap = new Map<string, string>(); // name -> gameId
  for (const gameName of gamesToCreate) {
    let slug = gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let game = await prisma.game.findUnique({ where: { slug } });
    if (!game) {
      game = await prisma.game.create({
        data: {
          name: gameName,
          slug,
        }
      });
      console.log(`Created Game: ${gameName} (ID: ${game.id})`);
    } else {
      console.log(`Game already exists: ${gameName} (ID: ${game.id})`);
    }
    gameMap.set(gameName, game.id);
  }

  // 3. Update Expansions
  console.log('Updating Expansions...');
  for (const [gameName, gameId] of gameMap.entries()) {
    const result = await prisma.expansion.updateMany({
      where: { game: gameName, gameId: null },
      data: { gameId }
    });
    console.log(`Updated ${result.count} expansions for game ${gameName}`);
  }

  // 4. Update CardDetails
  console.log('Updating CardDetails...');
  for (const [gameName, gameId] of gameMap.entries()) {
    const result = await prisma.cardDetail.updateMany({
      where: { game: gameName, gameId: null },
      data: { gameId }
    });
    console.log(`Updated ${result.count} card details for game ${gameName}`);
  }

  // 5. Update Finishes
  console.log('Updating Finishes...');
  for (const [gameName, gameId] of gameMap.entries()) {
    const result = await prisma.finish.updateMany({
      where: { game: gameName, gameId: null },
      data: { gameId }
    });
    console.log(`Updated ${result.count} finishes for game ${gameName}`);
  }

  // 6. Update Stores
  console.log('Updating Stores...');
  const stores = await prisma.store.findMany();
  for (const store of stores) {
    if (store.games && store.games.length > 0) {
      const gameIds = store.games.map(gName => gameMap.get(gName)).filter(Boolean) as string[];
      if (gameIds.length > 0) {
        await prisma.store.update({
          where: { id: store.id },
          data: {
            supportedGames: {
              connect: gameIds.map(id => ({ id }))
            }
          }
        });
        console.log(`Updated store ${store.name} with ${gameIds.length} games`);
      }
    }
  }

  console.log('Migration completed successfully!');
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
