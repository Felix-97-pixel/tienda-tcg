import { IQuery } from '@nestjs/cqrs';

export class GetTopProductsQuery implements IQuery {
  constructor(
    public readonly startDate?: string,
    public readonly endDate?: string,
    public readonly userId?: string,
    public readonly role?: string,
    public readonly storeId?: string,
  ) {}
}
