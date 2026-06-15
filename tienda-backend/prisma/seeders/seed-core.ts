import { PrismaClient } from '@prisma/client';

export async function seedCore(prisma: PrismaClient) {
  console.log('--- Seeding Conditions ---');
  const conditions = [
    { name: 'NM' },
    { name: 'near_mint' },
    { name: 'mint' },
    { name: 'light_played' }
  ];

  for (const condition of conditions) {
    await prisma.condition.upsert({
      where: { name: condition.name },
      update: {},
      create: condition,
    });
  }

  console.log('--- Seeding Languages ---');
  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Italian', code: 'it' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Chinese', code: 'zh_CN' },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name },
      create: lang,
    });
  }
}
