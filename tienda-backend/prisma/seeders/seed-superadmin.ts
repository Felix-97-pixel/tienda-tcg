import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedSuperAdmin(prisma: PrismaClient) {
  console.log('--- Seeding SuperAdmin ---');

  const email = 'superadmin@example.com';
  const password = await bcrypt.hash('superadmin123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.SUPERADMIN,
    },
    create: {
      email,
      password,
      name: 'Super Admin',
      role: Role.SUPERADMIN,
      isVerified: true,
    },
  });

  console.log('Superadmin configurado exitosamente.');
}
