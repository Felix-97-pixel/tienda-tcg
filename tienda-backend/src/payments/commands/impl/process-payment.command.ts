import { CreateOrderDto } from '../../dto/create-order.dto';

export class ProcessPaymentCommand {
  constructor(
    public readonly dto: CreateOrderDto,
    public readonly userId: string | null,
  ) {}
}
