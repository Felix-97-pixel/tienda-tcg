
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('--- Limpiando base de datos ---');
    await prisma.inventoryItem.deleteMany();
    await prisma.cardDetail.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.language.deleteMany();
    await prisma.condition.deleteMany();
    // await prisma.user.deleteMany(); // Opcional, dependiendo de si quieres borrar usuarios

    console.log('--- Creando Categorías ---');
    const catCarpetas = await prisma.category.create({
      data: { name: 'Carpetas', slug: 'carpetas', isTcg: false }
    });
    const catProtectores = await prisma.category.create({
      data: { name: 'Protectores', slug: 'protectores', isTcg: false }
    });
    const catDeckboxes = await prisma.category.create({
      data: { name: 'Deckboxes', slug: 'deckboxes', isTcg: false }
    });
    const catSobres = await prisma.category.create({
      data: { name: 'Sobres', slug: 'sobres', isTcg: false }
    });
    const catDados = await prisma.category.create({
      data: { name: 'Dados', slug: 'dados', isTcg: false }
    });
    const catMtg = await prisma.category.create({
      data: { name: 'Singles Magic The Gathering', slug: 'singles-magic', isTcg: true }
    });
    const catPkm = await prisma.category.create({
      data: { name: 'Singles Pokemon', slug: 'singles-pokemon', isTcg: true }
    });
    const catRift = await prisma.category.create({
      data: { name: 'Riftbound', slug: 'riftbound', isTcg: true }
    });

    await prisma.brand.createMany({
      data: [
        { name: 'Wizards of the Coast' },
        { name: 'The Pokémon Company' },
      ]
    });

    console.log('--- Creando Idiomas ---');
    await prisma.language.createMany({
      data: [
        { name: 'Spanish', code: 'es' },
        { name: 'English', code: 'en' },
        { name: 'Chinese', code: 'zh_CN' },
        { name: 'Japanese', code: 'ja' },
        { name: 'Italian', code: 'it' },
        { name: 'French', code: 'fr' },
        { name: 'German', code: 'de' },
        { name: 'Portuguese', code: 'pt' },
        { name: 'Korean', code: 'ko' },
        { name: 'Russian', code: 'ru' },
      ]
    });

    console.log('--- Creando Condiciones ---');
    await prisma.condition.createMany({
      data: [
        { name: 'near_mint' },
        { name: 'mint' },
        { name: 'excellent' },
        { name: 'good' },
        { name: 'light_played' },
        { name: 'played' },
        { name: 'poor' },
      ]
    });

    console.log('--- Creando Usuario Administrador ---');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'f.pinto.97@gmail.com' },
      update: {},
      create: {
        email: 'f.pinto.97@gmail.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN'
      }
    });

    console.log('✅ Seed completado exitosamente');
    console.log('📧 Usuario: f.pinto.97@gmail.com');
    console.log('🔑 Contraseña temporal: admin123');

  } catch (e) {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();