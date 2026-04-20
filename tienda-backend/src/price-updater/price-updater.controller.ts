import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';

@Controller('price-updater')
export class PriceUpdaterController {
  constructor(private readonly priceUpdaterService: PriceUpdaterService) { }
  /*EJEMPLO DE CONSULTA
    Invoke-RestMethod -Method POST -Uri "http://localhost:3000/price-updater/sync-set" -ContentType "application/json" -Body '{"expansion": "Avatar: The Last Airbender"}'
  */
  @Post('sync-set')
  @HttpCode(200)
  async syncSetPrices(@Body('expansion') expansion: string) {
    if (!expansion) {
      return { error: 'Debes enviar el nombre de la expansión en el cuerpo de la petición (ej: { "expansion": "Duskmourn: House of Horror" })' };
    }

    // Validación rápida: ¿Existe esta expansión en la BD?
    const exists = await this.priceUpdaterService.checkExpansionExists(expansion);
    if (!exists) {
      return {
        error: `La expansión '${expansion}' no existe en tu base de datos. Asegúrate de sincronizarla primero o de escribir el nombre exactamente igual a como está guardada.`
      };
    }

    // Ejecutamos en segundo plano para no bloquear la respuesta HTTP
    this.priceUpdaterService.updateSetPrices(expansion);

    return {
      message: `La actualización de precios para la expansión '${expansion}' ha comenzado en segundo plano.`,
      source: 'MTGJSON (100% libre de scraping)'
    };
  }
}
