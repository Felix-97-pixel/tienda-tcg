import { InitTransactionHandler } from './handlers/init-transaction.handler';
import { CommitTransactionHandler } from './handlers/commit-transaction.handler';

export const CommandHandlers = [
  InitTransactionHandler,
  CommitTransactionHandler,
];
