const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.store.findUnique({where:{subdomain:'bloodmoongames'}})
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
