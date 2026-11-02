import { PrismaService } from '../../../prisma/prisma.service';

export async function resolveQueryStoreId(
  prisma: PrismaService,
  userId?: string,
  role?: string,
  requestedStoreId?: string,
): Promise<string | null> {
  if (role === 'SUPERADMIN' && !requestedStoreId) {
    return null;
  }
  if (!userId) return null;

  let whereCondition: any = {
    OR: [
      { ownerId: userId },
      { members: { some: { userId } } },
      { company: { ownerId: userId } },
      { company: { members: { some: { userId } } } },
    ],
  };

  if (requestedStoreId) {
    whereCondition = {
      id: requestedStoreId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
        { company: { ownerId: userId } },
        { company: { members: { some: { userId } } } },
      ],
    };
  }

  const store = await prisma.store.findFirst({
    where: whereCondition,
    select: { id: true },
    orderBy: { isMainBranch: 'desc' },
  });

  return store?.id || null;
}
