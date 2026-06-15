import { PrismaClient } from '@prisma/client';

export async function seedGamesTcg(prisma: PrismaClient) {
  console.log('--- Seeding Games ---');
  const gamesData = [
    { name: 'Magic: The Gathering', slug: 'magic' },
    { name: 'Riftbound', slug: 'riftbound' },
  ];

  for (const g of gamesData) {
    await prisma.game.upsert({
      where: { name: g.name },
      update: { slug: g.slug },
      create: g,
    });
  }

  console.log('--- Seeding Categories ---');
  const categoriesData = [
    { name: 'Fundas', slug: 'fundas', isTcg: false },
    { name: 'Carpetas', slug: 'carpetas', isTcg: false },
    { name: 'Deckboxes', slug: 'deckboxes', isTcg: false },
    { name: 'Dados', slug: 'dados', isTcg: false },
    { name: 'Singles Magic The Gathering', slug: 'singles-magic', isTcg: true },
    { name: 'Singles Pokemon', slug: 'singles-pokemon', isTcg: true },
    { name: 'Singles Riftbound', slug: 'singles-riftbound', isTcg: true },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { slug: cat.slug, isTcg: cat.isTcg },
      create: cat,
    });
  }

  console.log('--- Seeding Brands ---');
  const brandsData = [
    { name: 'DragonShield' },
    { name: 'Wizards of the Coast' },
    { name: 'The Pokémon Company' },
    { name: 'Riftbound Studios' },
    { name: 'Ultimate Guard' },
    { name: 'Dragon Shield' },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
  }

  console.log('--- Seeding Finishes per Game ---');
  const magic = await prisma.game.findUnique({ where: { name: 'Magic: The Gathering' } });
  const pokemon = await prisma.game.findUnique({ where: { name: 'Pokémon' } });
  const riftbound = await prisma.game.findUnique({ where: { name: 'Riftbound' } });

  const finishesData = [
    ...(magic ? [
      { name: 'Normal', gameId: magic.id },
      { name: 'Foil', gameId: magic.id },
      { name: 'Etched Foil', gameId: magic.id },
      { name: 'Glossy Foil', gameId: magic.id },
    ] : []),
    ...(pokemon ? [
      { name: 'Normal', gameId: pokemon.id },
      { name: 'Holofoil', gameId: pokemon.id },
      { name: 'Reverse Holofoil', gameId: pokemon.id },
      { name: 'Unlimited Holofoil', gameId: pokemon.id },
    ] : []),
    ...(riftbound ? [
      { name: 'Normal', gameId: riftbound.id },
      { name: 'Foil', gameId: riftbound.id },
    ] : []),
  ];

  for (const f of finishesData) {
    await prisma.finish.upsert({
      where: { name_gameId: { name: f.name, gameId: f.gameId } },
      update: {},
      create: f,
    });
  }
}
