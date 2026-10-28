import { ProcessPaymentHandler } from './handlers/process-payment.handler';
import { DispatchVendorOrderHandler } from './handlers/dispatch-vendor-order.handler';
import { CommitTransactionHandler } from './handlers/commit-transaction.handler';
import { InitTransactionHandler } from './handlers/init-transaction.handler';
import { CreateMpPreferenceHandler } from './handlers/create-mp-preference.handler';

export const CommandHandlers = [
  ProcessPaymentHandler,
  DispatchVendorOrderHandler,
  CommitTransactionHandler,
  InitTransactionHandler,
  CreateMpPreferenceHandler,
];
