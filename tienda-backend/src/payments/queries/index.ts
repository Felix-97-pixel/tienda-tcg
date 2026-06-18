import { GetOrderStatusHandler } from './handlers/get-order-status.handler';
import { ListOrdersHandler } from './handlers/list-orders.handler';
import { GetSalesStatsHandler } from './handlers/get-sales-stats.handler';
import { GetAdvancedReportsHandler } from './handlers/get-advanced-reports.handler';
import { ExportReportsHandler } from './handlers/export-reports.handler';
import { GetTopProductsHandler } from './handlers/get-top-products.handler';

export const QueryHandlers = [
  GetOrderStatusHandler,
  ListOrdersHandler,
  GetSalesStatsHandler,
  GetAdvancedReportsHandler,
  ExportReportsHandler,
  GetTopProductsHandler,
];
