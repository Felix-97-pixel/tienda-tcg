import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustCreditDto } from './dto/adjust-credit.dto';
import { TransactionItemData } from './interfaces/transaction-item.interface';

@Injectable()
export class StoreCreditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all store credit records for a given store, ordered by balance descending.
   * Includes the user's basic info for display in the admin table.
   */
  async getStoreCredits(storeId: string) {
    return this.prisma.storeCredit.findMany({
      where: { storeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { balance: 'desc' },
    });
  }

  /**
   * Returns a single user's store credit balance.
   * Returns `{ balance: 0 }` if no record exists yet.
   */
  async getUserStoreCredit(storeId: string, userId: string) {
    const credit = await this.prisma.storeCredit.findUnique({
      where: { storeId_userId: { storeId, userId } },
    });
    return credit || { balance: 0 };
  }

  /**
   * Returns all transactions for a given user in a store, newest first.
   */
  async getTransactions(storeId: string, userId: string) {
    return this.prisma.storeCreditTransaction.findMany({
      where: { storeId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Adjusts a user's store credit balance and records the transaction atomically.
   *
   * Key behaviors:
   * - Upserts the balance (creates the record if this is the user's first credit).
   * - **Prevents negative balances**: if the adjustment would result in a negative
   *   balance, a `BadRequestException` is thrown.
   * - Stores an optional `itemsData` snapshot for trade-in/purchase records.
   */
  async adjustCredit(storeId: string, dto: AdjustCreditDto) {
    const { userId, amount, type, reference = '', itemsData } = dto;

    if (amount === 0) {
      throw new BadRequestException('El monto no puede ser cero');
    }

    return this.prisma.$transaction(async (tx) => {
      // If subtracting, verify the user has sufficient balance
      if (amount < 0) {
        const current = await tx.storeCredit.findUnique({
          where: { storeId_userId: { storeId, userId } },
        });

        const currentBalance = current ? Number(current.balance) : 0;

        if (currentBalance + amount < 0) {
          throw new BadRequestException(
            `Saldo insuficiente. Saldo actual: $${currentBalance.toLocaleString('es-CL')}, descuento solicitado: $${Math.abs(amount).toLocaleString('es-CL')}`,
          );
        }
      }

      // Upsert the balance
      const credit = await tx.storeCredit.upsert({
        where: { storeId_userId: { storeId, userId } },
        update: {
          balance: { increment: amount },
        },
        create: {
          storeId,
          userId,
          balance: amount,
        },
      });

      // Record the transaction with optional items snapshot
      await tx.storeCreditTransaction.create({
        data: {
          storeId,
          userId,
          amount,
          type,
          reference,
          itemsData: (itemsData ?? undefined) as any,
        },
      });

      return credit;
    });
  }
}
