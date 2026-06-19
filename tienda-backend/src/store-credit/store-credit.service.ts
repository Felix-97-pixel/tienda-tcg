import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreCreditService {
  constructor(private prisma: PrismaService) {}

  async getStoreCredits(storeId: string) {
    return this.prisma.storeCredit.findMany({
      where: { storeId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { balance: 'desc' },
    });
  }

  async getUserStoreCredit(storeId: string, userId: string) {
    const credit = await this.prisma.storeCredit.findUnique({
      where: { storeId_userId: { storeId, userId } },
    });
    return credit || { balance: 0 };
  }

  async getTransactions(storeId: string, userId: string) {
    return this.prisma.storeCreditTransaction.findMany({
      where: { storeId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adjustCredit(storeId: string, userId: string, amount: number, type: string, reference: string = '', itemsData: any = null) {
    if (amount === 0) throw new BadRequestException('Amount cannot be zero');

    return this.prisma.$transaction(async (tx) => {
      // Upsert the balance
      const credit = await tx.storeCredit.upsert({
        where: { storeId_userId: { storeId, userId } },
        update: {
          balance: { increment: amount }
        },
        create: {
          storeId,
          userId,
          balance: amount
        }
      });

      // Record transaction
      await tx.storeCreditTransaction.create({
        data: {
          storeId,
          userId,
          amount,
          type,
          reference,
          itemsData
        }
      });

      return credit;
    });
  }
}
