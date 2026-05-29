/**
 * Command: Confirmar una transacción de pago.
 * Recibe el token de Webpay y ejecuta el commit.
 */
export class CommitTransactionCommand {
  constructor(
    public readonly token: string,
  ) {}
}
