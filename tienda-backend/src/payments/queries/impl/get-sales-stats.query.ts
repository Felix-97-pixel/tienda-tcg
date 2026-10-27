/**
 * Query: Obtener estadísticas de ventas para el dashboard administrativo.
 */
export class GetSalesStatsQuery {
  constructor(
    public readonly userId?: string,
    public readonly role?: string,
  ) {}
}

