import { IQuery } from '@nestjs/cqrs'; export class ExportReportsQuery implements IQuery { constructor(public readonly type: 'inventory' | 'deadstock' | 'transactions' | 'lowstock') {} }
