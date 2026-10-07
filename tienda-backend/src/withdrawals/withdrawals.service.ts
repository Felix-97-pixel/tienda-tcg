import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async requestWithdrawal(userId: string, amount: number, bankDetails: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) throw new NotFoundException('Store not found');

    if (Number(store.balance) < amount) {
      throw new BadRequestException('Saldo insuficiente para retirar');
    }

    // Descontar saldo y crear peticion en PENDING
    return await this.prisma.$transaction(async (tx) => {
      await tx.store.update({
        where: { id: store.id },
        data: { balance: { decrement: amount } }
      });

      return await tx.withdrawalRequest.create({
        data: {
          storeId: store.id,
          amount,
          bankDetails,
          status: 'PENDING',
        }
      });
    });
  }

  async getPendingWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: { store: true }
    });
  }

  async getStoreHistory(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const transactions = await this.prisma.walletTransaction.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });

    return { transactions, withdrawals, balance: store.balance };
  }

  async completeWithdrawal(id: string) {
    const req = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING') throw new BadRequestException('Request is not PENDING');

    return await this.prisma.$transaction(async (tx) => {
      // Registrar transaccion en el historial de la billetera (retiro consumado)
      await tx.walletTransaction.create({
        data: {
          storeId: req.storeId,
          amount: req.amount,
          type: 'WITHDRAWAL',
          reference: `Withdrawal ID: ${req.id}`,
        }
      });

      return await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });
    });
  }

  async rejectWithdrawal(id: string) {
    const req = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING') throw new BadRequestException('Request is not PENDING');

    return await this.prisma.$transaction(async (tx) => {
      // Devolver saldo a la tienda
      await tx.store.update({
        where: { id: req.storeId },
        data: { balance: { increment: req.amount } }
      });

      return await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
    });
  }
}
