import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto } from './dto/create-order.dto';
import { DispatchVendorOrderDto } from './dto/dispatch-vendor-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

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
   * PATCH /payments/vendor-orders/:id/dispatch
   * Registra despacho e ingresa nÃºmero de seguimiento oficial, liberando fondos en custodia.
   */
  @Patch('vendor-orders/:id/dispatch')
  @UseGuards(JwtAuthGuard)
  async dispatchVendorOrder(
    @Param('id') vendorOrderId: string,
    @Body() dto: DispatchVendorOrderDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const { DispatchVendorOrderCommand } = await import(
      './commands/impl/dispatch-vendor-order.command'
    );
    return this.commandBus.execute(
      new DispatchVendorOrderCommand(vendorOrderId, dto, req.user.userId),
    );
  }



  /**
   * POST /payments/process
   * Procesa un pago con Mercado Pago (Custom Checkout)
   */
  /**
   * POST /payments/create-preference
   * Inicia una transacción de Checkout Pro con Mercado Pago (Redirección Externa)
   */
  @Post('create-preference')
  @UseGuards(OptionalJwtAuthGuard)
  async createPreference(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId ?? null;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/checkout/result`;
    const { CreateMpPreferenceCommand } = await import(
      './commands/impl/create-mp-preference.command'
    );
    return this.commandBus.execute(
      new CreateMpPreferenceCommand(dto, userId, returnUrl),
    );
  }

  /**
   * POST /payments/process
   */
  @Post('process')
  @UseGuards(OptionalJwtAuthGuard)
  async processTransaction(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId ?? null;
    const { ProcessPaymentCommand } = await import(
      './commands/impl/process-payment.command'
    );
    return this.commandBus.execute(new ProcessPaymentCommand(dto, userId));
  }

  /**
   * POST /payments/init-transaction
   * Inicia una transacciÃ³n de pago con Webpay Plus (Transbank)
   */
  @Post('init-transaction')
  @UseGuards(OptionalJwtAuthGuard)
  async initTransaction(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId ?? null;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/checkout/result`;
    const { InitTransactionCommand } = await import(
      './commands/impl/init-transaction.command'
    );
    return this.commandBus.execute(
      new InitTransactionCommand(dto, userId, returnUrl),
    );
  }

  /**
   * POST /payments/commit-transaction
   * Confirma la transacciÃ³n con Webpay Plus al retornar de Transbank
   */
  @Post('commit-transaction')
  async commitTransaction(@Body() body: { token_ws: string }) {
    if (!body?.token_ws) {
      throw new BadRequestException('token_ws es requerido para confirmar la transacciÃ³n');
    }
    const { CommitTransactionCommand } = await import(
      './commands/impl/commit-transaction.command'
    );
    return this.commandBus.execute(
      new CommitTransactionCommand(body.token_ws),
    );
  }



  /**
   * GET /payments/order/:orderId
   * Estado de una orden (para la pÃ¡gina de resultado)
   */
  @Get('order/:orderId')
  @UseGuards(OptionalJwtAuthGuard)
  getOrderStatus(
    @Param('orderId') orderId: string,
    @Req() req: Request & { user?: { userId: string; role?: string } },
  ) {
    return this.queryBus.execute(
      new GetOrderStatusQuery(orderId, req.user?.userId, req.user?.role),
    );
  }

  /**
   * GET /payments/orders  (Admin)
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  listOrders(
    @Req() req: Request & { user?: { userId: string; role?: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('deliveryStatus') deliveryStatus?: string,
  ) {
    return this.queryBus.execute(
      new ListOrdersQuery(
        +page,
        +limit,
        req.user?.userId,
        req.user?.role,
        status,
        deliveryStatus,
      ),
    );
  }

  /**
   * GET /payments/stats  (Admin)
   * EstadÃ­sticas de ventas: revenue, top productos, Ã³rdenes recientes
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  getSalesStats(@Req() req: Request & { user?: { userId: string; role?: string } }) {
    return this.queryBus.execute(new GetSalesStatsQuery(req.user?.userId, req.user?.role));
  }

  /**
   * GET /payments/stats/top-products (Admin)
   * Productos mÃ¡s vendidos con filtros de fecha opcionales
   */
  @Get('stats/top-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  getTopProducts(
    @Req() req: Request & { user?: { userId: string; role?: string } },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.queryBus.execute(new GetTopProductsQuery(startDate, endDate, req.user?.userId, req.user?.role));
  }

  /**
   * GET /payments/reports/advanced (Admin)
   * EstadÃ­sticas avanzadas de ventas, inventario y catÃ¡logo
   */
  @Get('reports/advanced')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  getAdvancedReports(@Req() req: Request & { user?: { userId: string; role?: string } }) {
    return this.queryBus.execute(new GetAdvancedReportsQuery(req.user?.userId, req.user?.role));
  }

  /**
   * GET /payments/reports/export/:type (Admin)
   * Exporta datos en crudo para CSV (inventory, deadstock, transactions)
   */
  @Get('reports/export/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  exportReports(
    @Param('type') type: 'inventory' | 'deadstock' | 'transactions' | 'lowstock',
    @Req() req: Request & { user?: { userId: string; role?: string } },
  ) {
    return this.queryBus.execute(new ExportReportsQuery(type, req.user?.userId, req.user?.role));
  }
}
