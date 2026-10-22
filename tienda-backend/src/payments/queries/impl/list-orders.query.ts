/**
 * Query: Listar órdenes con paginación (Admin).
 */
export class ListOrdersQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly userId?: string,
    public readonly role?: string,
  ) {}
}
