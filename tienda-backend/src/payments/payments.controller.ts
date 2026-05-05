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
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
    return this.paymentsService.initTransaction(dto, userId, callbackUrl);
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
      const result = await this.paymentsService.commitTransaction(token);
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
    return this.paymentsService.getOrderStatus(orderId);
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
    return this.paymentsService.listOrders(+page, +limit);
  }

  /**
   * GET /payments/stats  (Admin)
   * Estadísticas de ventas: revenue, top productos, órdenes recientes
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getSalesStats() {
    return this.paymentsService.getSalesStats();
  }
}
