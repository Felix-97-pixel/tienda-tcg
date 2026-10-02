import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';

import { GetOrderStatusQuery } from './queries/impl/get-order-status.query';
import { ListOrdersQuery } from './queries/impl/list-orders.query';
import { GetSalesStatsQuery } from './queries/impl/get-sales-stats.query';
import { GetAdvancedReportsQuery } from './queries/impl/get-advanced-reports.query';
import { ExportReportsQuery } from './queries/impl/export-reports.query';
import { GetTopProductsQuery } from './queries/impl/get-top-products.query';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}



  /**
   * POST /payments/process
   * Procesa un pago con Mercado Pago (Custom Checkout)
   */
  @Post('process')
  @UseGuards(OptionalJwtAuthGuard)
  async processTransaction(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId ?? null;
    const { ProcessPaymentCommand } = await import('./commands/impl/process-payment.command');
    return this.commandBus.execute(
      new ProcessPaymentCommand(dto, userId),
    );
  }



  /**
   * GET /payments/order/:orderId
   * Estado de una orden (para la página de resultado)
   */
  @Get('order/:orderId')
  getOrderStatus(@Param('orderId') orderId: string) {
    return this.queryBus.execute(new GetOrderStatusQuery(orderId));
  }

  /**
   * GET /payments/orders  (Admin)
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  listOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.queryBus.execute(new ListOrdersQuery(+page, +limit));
  }

  /**
   * GET /payments/stats  (Admin)
   * Estadísticas de ventas: revenue, top productos, órdenes recientes
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getSalesStats() {
    return this.queryBus.execute(new GetSalesStatsQuery());
  }

  /**
   * GET /payments/stats/top-products (Admin)
   * Productos más vendidos con filtros de fecha opcionales
   */
  @Get('stats/top-products')
  @UseGuards(JwtAuthGuard)
  getTopProducts(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.queryBus.execute(new GetTopProductsQuery(startDate, endDate));
  }

  /**
   * GET /payments/reports/advanced (Admin)
   * Estadísticas avanzadas de ventas, inventario y catálogo
   */
  @Get('reports/advanced')
  @UseGuards(JwtAuthGuard)
  getAdvancedReports() {
    return this.queryBus.execute(new GetAdvancedReportsQuery());
  }

  /**
   * GET /payments/reports/export/:type (Admin)
   * Exporta datos en crudo para CSV (inventory, deadstock, transactions)
   */
  @Get('reports/export/:type')
  @UseGuards(JwtAuthGuard)
  exportReports(@Param('type') type: 'inventory' | 'deadstock' | 'transactions' | 'lowstock') {
    return this.queryBus.execute(new ExportReportsQuery(type));
  }
}
