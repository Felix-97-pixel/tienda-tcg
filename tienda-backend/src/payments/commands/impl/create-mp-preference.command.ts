import { CreateOrderDto } from '../../dto/create-order.dto';

/**
 * Command: Iniciar una transacción con Mercado Pago Checkout Pro (Preferencia de Pago).
 * Crea la orden en BD e inicia la preferencia con Mercado Pago.
 */
export class CreateMpPreferenceCommand {
  constructor(
    public readonly dto: CreateOrderDto,
    public readonly userId: string | null,
    public readonly returnUrl: string,
  ) {}
}

