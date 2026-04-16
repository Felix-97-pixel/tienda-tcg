import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
// Usa tu ruta generada si mantuviste esa configuración, 
// o '@prisma/client' si volviste a la opción por defecto.
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Instanciamos el Pool de conexiones usando tu .env
    /*
    const connectionString = `${process.env.DATABASE_URL}`;
    const pool = new Pool({ connectionString });
    */
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: {
        // Esto permite que la conexión se establezca aunque el certificado 
        // de Neon sea auto-firmado o el entorno no lo reconozca.
        rejectUnauthorized: false 
      }
    });
    
    // 2. Pasamos el Pool al adaptador de Prisma
    const adapter = new PrismaPg(pool);
    
    // 3. Inicializamos el PrismaClient pasándole el adaptador
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}