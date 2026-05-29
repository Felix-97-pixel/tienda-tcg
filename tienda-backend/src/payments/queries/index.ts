import { GetOrderStatusHandler } from './handlers/get-order-status.handler';
import { ListOrdersHandler } from './handlers/list-orders.handler';
import { GetSalesStatsHandler } from './handlers/get-sales-stats.handler';

export const QueryHandlers = [
  GetOrderStatusHandler,
  ListOrdersHandler,
  GetSalesStatsHandler,
];
