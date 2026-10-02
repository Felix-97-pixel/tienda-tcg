import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.storeSetting.findMany({
    where: { key: { startsWith: 'MP_' } }
  });
  console.log("MP Settings in DB:", settings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
