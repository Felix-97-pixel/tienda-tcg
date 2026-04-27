const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    const user = await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'ADMIN' }
    });
    console.log(`User ${user.email} is now an ADMIN.`);
  } else {
    console.log('No users found in database.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
