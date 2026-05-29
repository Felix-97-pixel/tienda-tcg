import { CreateOrderDto } from '../../dto/create-order.dto';

/**
 * Command: Iniciar una transacción de pago.
 * Crea la orden en BD e inicia la transacción con Webpay.
 */
export class InitTransactionCommand {
  constructor(
    public readonly dto: CreateOrderDto,
    public readonly userId: string | null,
    public readonly returnUrl: string,
  ) {}
}
