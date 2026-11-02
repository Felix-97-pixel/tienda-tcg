import { IQuery } from '@nestjs/cqrs';

export class GetAdvancedReportsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly role?: string,
    public readonly storeId?: string,
  ) {}
}
