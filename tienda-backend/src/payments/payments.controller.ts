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
import { InitTransactionCommand } from './commands/impl/init-transaction.command';
import { CommitTransactionCommand } from './commands/impl/commit-transaction.command';
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
   * POST /payments/init
   * Crea la orden y devuelve token + URL de Webpay
   * Funciona tanto para usuarios autenticados como invitados
   */
  @Post('init')
  @UseGuards(OptionalJwtAuthGuard)
  async initTransaction(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const backendUrl =
      process.env.BACKEND_URL ?? 'http://localhost:3001/api/v1';
    const callbackUrl = `${backendUrl}/payments/commit`;

    const userId = req.user?.userId ?? null;
    return this.commandBus.execute(
      new InitTransactionCommand(dto, userId, callbackUrl),
    );
  }

  /**
   * GET /payments/commit?token_ws=TOKEN
   * Webpay redirige aquí tras el pago (GET con token_ws)
   * Confirma la tx y redirige al frontend con el resultado
   */
  @Get('commit')
  async commitTransaction(
    @Query('token_ws') token: string,
    @Query('TBK_TOKEN') tbkToken: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    // Si Webpay cancela, manda TBK_TOKEN en lugar de token_ws
    if (!token && tbkToken) {
      return res.redirect(`${frontendUrl}/checkout/result?status=cancelled`);
    }

    if (!token) {
      return res.redirect(`${frontendUrl}/checkout/result?status=error`);
    }

    try {
      const result = await this.commandBus.execute(
        new CommitTransactionCommand(token),
      );
      const status = result.approved ? 'success' : 'failed';
      return res.redirect(
        `${frontendUrl}/checkout/result?status=${status}&orderId=${result.orderId}`,
      );
    } catch {
      return res.redirect(`${frontendUrl}/checkout/result?status=error`);
    }
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
