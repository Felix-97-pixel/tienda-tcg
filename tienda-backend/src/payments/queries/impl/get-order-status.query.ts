/**
 * Query: Obtener el estado de una orden por su ID.
 */
export class GetOrderStatusQuery {
  constructor(
    public readonly orderId: string,
  ) {}
}
