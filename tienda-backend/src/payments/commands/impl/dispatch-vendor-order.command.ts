import { DispatchVendorOrderDto } from '../../dto/dispatch-vendor-order.dto';

export class DispatchVendorOrderCommand {
  constructor(
    public readonly vendorOrderId: string,
    public readonly dto: DispatchVendorOrderDto,
    public readonly userId: string,
  ) {}
}
