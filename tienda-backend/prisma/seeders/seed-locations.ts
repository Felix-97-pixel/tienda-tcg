import { PrismaClient } from '@prisma/client';

export const INITIAL_LOGISTIC_ZONES = [
  {
    code: 'RM',
    name: 'Región Metropolitana',
    description: 'Zona Metropolitana central de despacho sin recargo',
  },
  {
    code: 'NORTE_GRANDE',
    name: 'Zona Norte Grande',
    description: 'Arica y Parinacota, Tarapacá y Antofagasta',
  },
  {
    code: 'NORTE_CHICO',
    name: 'Zona Norte Chico',
    description: 'Atacama y Coquimbo',
  },
  {
    code: 'CENTRO',
    name: 'Zona Centro',
    description: 'Valparaíso, O’Higgins, Maule, Ñuble y Biobío',
  },
  {
    code: 'SUR',
    name: 'Zona Sur',
    description: 'La Araucanía, Los Ríos y Los Lagos',
  },
  {
    code: 'EXTREMO_SUR',
    name: 'Zona Extremo Sur / Austral',
    description: 'Aysén del General Carlos Ibáñez del Campo y Magallanes',
  },
  {
    code: 'INSULAR',
    name: 'Zona Insular',
    description: 'Territorios especiales de Isla de Pascua y Juan Fernández',
  },
];

export const CHILE_REGIONS = [
  {
    code: 'XV',
    name: 'Región de Arica y Parinacota',
    shortName: 'Arica y Parinacota',
    zone: 'NORTE_GRANDE',
    communes: [
      { code: 'ARICA', name: 'Arica', zone: 'NORTE_GRANDE' },
      { code: 'CAMARONES', name: 'Camarones', zone: 'NORTE_GRANDE' },
      { code: 'PUTRE', name: 'Putre', zone: 'NORTE_GRANDE' },
      { code: 'GENERAL_LAGOS', name: 'General Lagos', zone: 'NORTE_GRANDE' },
    ],
  },
  {
    code: 'I',
    name: 'Región de Tarapacá',
    shortName: 'Tarapacá',
    zone: 'NORTE_GRANDE',
    communes: [
      { code: 'IQUIQUE', name: 'Iquique', zone: 'NORTE_GRANDE' },
      { code: 'ALTO_HOSPICIO', name: 'Alto Hospicio', zone: 'NORTE_GRANDE' },
      { code: 'POZO_ALMONTE', name: 'Pozo Almonte', zone: 'NORTE_GRANDE' },
      { code: 'CAMINA', name: 'Camiña', zone: 'NORTE_GRANDE' },
      { code: 'COLCHANE', name: 'Colchane', zone: 'NORTE_GRANDE' },
      { code: 'HUARA', name: 'Huara', zone: 'NORTE_GRANDE' },
      { code: 'PICA', name: 'Pica', zone: 'NORTE_GRANDE' },
    ],
  },
  {
    code: 'II',
    name: 'Región de Antofagasta',
    shortName: 'Antofagasta',
    zone: 'NORTE_GRANDE',
    communes: [
      { code: 'ANTOFAGASTA', name: 'Antofagasta', zone: 'NORTE_GRANDE' },
      { code: 'MEJILLONES', name: 'Mejillones', zone: 'NORTE_GRANDE' },
      { code: 'SIERRA_GORDA', name: 'Sierra Gorda', zone: 'NORTE_GRANDE' },
      { code: 'TALTAL', name: 'Taltal', zone: 'NORTE_GRANDE' },
      { code: 'CALAMA', name: 'Calama', zone: 'NORTE_GRANDE' },
      { code: 'OLLAGUE', name: 'Ollagüe', zone: 'NORTE_GRANDE' },
      { code: 'SAN_PEDRO_DE_ATACAMA', name: 'San Pedro de Atacama', zone: 'NORTE_GRANDE' },
      { code: 'TOCOPILLA', name: 'Tocopilla', zone: 'NORTE_GRANDE' },
      { code: 'MARIA_ELENA', name: 'María Elena', zone: 'NORTE_GRANDE' },
    ],
  },
  {
    code: 'III',
    name: 'Región de Atacama',
    shortName: 'Atacama',
    zone: 'NORTE_CHICO',
    communes: [
      { code: 'COPIAPO', name: 'Copiapó', zone: 'NORTE_CHICO' },
      { code: 'CALDERA', name: 'Caldera', zone: 'NORTE_CHICO' },
      { code: 'TIERRA_AMARILLA', name: 'Tierra Amarilla', zone: 'NORTE_CHICO' },
      { code: 'CHANARAL', name: 'Chañaral', zone: 'NORTE_CHICO' },
      { code: 'DIEGO_DE_ALMAGRO', name: 'Diego de Almagro', zone: 'NORTE_CHICO' },
      { code: 'VALLENAR', name: 'Vallenar', zone: 'NORTE_CHICO' },
      { code: 'ALTO_DEL_CARMEN', name: 'Alto del Carmen', zone: 'NORTE_CHICO' },
      { code: 'FREIRINA', name: 'Freirina', zone: 'NORTE_CHICO' },
      { code: 'HUASCO', name: 'Huasco', zone: 'NORTE_CHICO' },
    ],
  },
  {
    code: 'IV',
    name: 'Región de Coquimbo',
    shortName: 'Coquimbo',
    zone: 'NORTE_CHICO',
    communes: [
      { code: 'LA_SERENA', name: 'La Serena', zone: 'NORTE_CHICO' },
      { code: 'COQUIMBO', name: 'Coquimbo', zone: 'NORTE_CHICO' },
      { code: 'ANDACOLLO', name: 'Andacollo', zone: 'NORTE_CHICO' },
      { code: 'LA_HIGUERA', name: 'La Higuera', zone: 'NORTE_CHICO' },
      { code: 'PAIGUANO', name: 'Paihuano', zone: 'NORTE_CHICO' },
      { code: 'VICUNA', name: 'Vicuña', zone: 'NORTE_CHICO' },
      { code: 'ILLAPEL', name: 'Illapel', zone: 'NORTE_CHICO' },
      { code: 'CANELA', name: 'Canela', zone: 'NORTE_CHICO' },
      { code: 'LOS_VILOS', name: 'Los Vilos', zone: 'NORTE_CHICO' },
      { code: 'SALAMANCA', name: 'Salamanca', zone: 'NORTE_CHICO' },
      { code: 'OVALLE', name: 'Ovalle', zone: 'NORTE_CHICO' },
      { code: 'COMBARBALA', name: 'Combarbalá', zone: 'NORTE_CHICO' },
      { code: 'MONTE_PATRIA', name: 'Monte Patria', zone: 'NORTE_CHICO' },
      { code: 'PUNITAQUI', name: 'Punitaqui', zone: 'NORTE_CHICO' },
      { code: 'RIO_HURTADO', name: 'Río Hurtado', zone: 'NORTE_CHICO' },
    ],
  },
  {
    code: 'V',
    name: 'Región de Valparaíso',
    shortName: 'Valparaíso',
    zone: 'CENTRO',
    communes: [
      { code: 'VALPARAISO', name: 'Valparaíso', zone: 'CENTRO' },
      { code: 'VINA_DEL_MAR', name: 'Viña del Mar', zone: 'CENTRO' },
      { code: 'CONCON', name: 'Concón', zone: 'CENTRO' },
      { code: 'QUILPUE', name: 'Quilpué', zone: 'CENTRO' },
      { code: 'VILLA_ALEMANA', name: 'Villa Alemana', zone: 'CENTRO' },
      { code: 'LIMACHE', name: 'Limache', zone: 'CENTRO' },
      { code: 'OLMUE', name: 'Olmué', zone: 'CENTRO' },
      { code: 'QUILLOTA', name: 'Quillota', zone: 'CENTRO' },
      { code: 'LA_CALERA', name: 'La Calera', zone: 'CENTRO' },
      { code: 'HIJUELAS', name: 'Hijuelas', zone: 'CENTRO' },
      { code: 'LA_CRUZ', name: 'La Cruz', zone: 'CENTRO' },
      { code: 'NOGALES', name: 'Nogales', zone: 'CENTRO' },
      { code: 'SAN_ANTONIO', name: 'San Antonio', zone: 'CENTRO' },
      { code: 'CARTAGENA', name: 'Cartagena', zone: 'CENTRO' },
      { code: 'EL_QUISCO', name: 'El Quisco', zone: 'CENTRO' },
      { code: 'EL_TABO', name: 'El Tabo', zone: 'CENTRO' },
      { code: 'ALGARROBO', name: 'Algarrobo', zone: 'CENTRO' },
      { code: 'SANTO_DOMINGO', name: 'Santo Domingo', zone: 'CENTRO' },
      { code: 'SAN_FELIPE', name: 'San Felipe', zone: 'CENTRO' },
      { code: 'LOS_ANDES', name: 'Los Andes', zone: 'CENTRO' },
      { code: 'CALLE_LARGA', name: 'Calle Larga', zone: 'CENTRO' },
      { code: 'RINCONADA', name: 'Rinconada', zone: 'CENTRO' },
      { code: 'SAN_ESTEBAN', name: 'San Esteban', zone: 'CENTRO' },
      { code: 'CATEMU', name: 'Catemu', zone: 'CENTRO' },
      { code: 'LLAILLAY', name: 'Llaillay', zone: 'CENTRO' },
      { code: 'PANQUEHUE', name: 'Panquehue', zone: 'CENTRO' },
      { code: 'PUTAENDO', name: 'Putaendo', zone: 'CENTRO' },
      { code: 'SANTA_MARIA', name: 'Santa María', zone: 'CENTRO' },
      { code: 'CABILDO', name: 'Cabildo', zone: 'CENTRO' },
      { code: 'LA_LIGUA', name: 'La Ligua', zone: 'CENTRO' },
      { code: 'PAPUDO', name: 'Papudo', zone: 'CENTRO' },
      { code: 'PETORCA', name: 'Petorca', zone: 'CENTRO' },
      { code: 'ZAPALLAR', name: 'Zapallar', zone: 'CENTRO' },
      { code: 'CASABLANCA', name: 'Casablanca', zone: 'CENTRO' },
      { code: 'PUCHUNCAVI', name: 'Puchuncaví', zone: 'CENTRO' },
      { code: 'QUINTERO', name: 'Quintero', zone: 'CENTRO' },
    ],
  },
  {
    code: 'RM',
    name: 'Región Metropolitana de Santiago',
    shortName: 'Metropolitana',
    zone: 'RM',
    communes: [
      { code: 'SANTIAGO', name: 'Santiago Centro', zone: 'RM' },
      { code: 'PROVIDENCIA', name: 'Providencia', zone: 'RM' },
      { code: 'LAS_CONDES', name: 'Las Condes', zone: 'RM' },
      { code: 'NUNOA', name: 'Ñuñoa', zone: 'RM' },
      { code: 'VITACURA', name: 'Vitacura', zone: 'RM' },
      { code: 'LA_REINA', name: 'La Reina', zone: 'RM' },
      { code: 'LO_BARNECHEA', name: 'Lo Barnechea', zone: 'RM' },
      { code: 'SAN_MIGUEL', name: 'San Miguel', zone: 'RM' },
      { code: 'MACUL', name: 'Macul', zone: 'RM' },
      { code: 'PENALOLEN', name: 'Peñalolén', zone: 'RM' },
      { code: 'LA_FLORIDA', name: 'La Florida', zone: 'RM' },
      { code: 'MAIPU', name: 'Maipú', zone: 'RM' },
      { code: 'PUDAHUEL', name: 'Pudahuel', zone: 'RM' },
      { code: 'ESTACION_CENTRAL', name: 'Estación Central', zone: 'RM' },
      { code: 'QUINTA_NORMAL', name: 'Quinta Normal', zone: 'RM' },
      { code: 'INDEPENDENCIA', name: 'Independencia', zone: 'RM' },
      { code: 'RECOLETA', name: 'Recoleta', zone: 'RM' },
      { code: 'CONCHALI', name: 'Conchalí', zone: 'RM' },
      { code: 'HUECHURABA', name: 'Huechuraba', zone: 'RM' },
      { code: 'QUILICURA', name: 'Quilicura', zone: 'RM' },
      { code: 'RENCA', name: 'Renca', zone: 'RM' },
      { code: 'CERRILLOS', name: 'Cerrillos', zone: 'RM' },
      { code: 'CERRO_NAVIA', name: 'Cerro Navia', zone: 'RM' },
      { code: 'LO_PRADO', name: 'Lo Prado', zone: 'RM' },
      { code: 'PEDRO_AGUIRRE_CERDA', name: 'Pedro Aguirre Cerda', zone: 'RM' },
      { code: 'SAN_JOAQUIN', name: 'San Joaquín', zone: 'RM' },
      { code: 'LA_CISTERNA', name: 'La Cisterna', zone: 'RM' },
      { code: 'LA_GRANJA', name: 'La Granja', zone: 'RM' },
      { code: 'LO_ESPEJO', name: 'Lo Espejo', zone: 'RM' },
      { code: 'SAN_RAMON', name: 'San Ramón', zone: 'RM' },
      { code: 'LA_PINTANA', name: 'La Pintana', zone: 'RM' },
      { code: 'EL_BOSQUE', name: 'El Bosque', zone: 'RM' },
      { code: 'PUENTE_ALTO', name: 'Puente Alto', zone: 'RM' },
      { code: 'PIRQUE', name: 'Pirque', zone: 'RM' },
      { code: 'SAN_JOSE_DE_MAIPO', name: 'San José de Maipo', zone: 'RM' },
      { code: 'SAN_BERNARDO', name: 'San Bernardo', zone: 'RM' },
      { code: 'BUIN', name: 'Buin', zone: 'RM' },
      { code: 'CALERA_DE_TANGO', name: 'Calera de Tango', zone: 'RM' },
      { code: 'PAINE', name: 'Paine', zone: 'RM' },
      { code: 'COLINA', name: 'Colina', zone: 'RM' },
      { code: 'LAMPA', name: 'Lampa', zone: 'RM' },
      { code: 'TILTIL', name: 'Tiltil', zone: 'RM' },
      { code: 'MELIPILLA', name: 'Melipilla', zone: 'RM' },
      { code: 'ALHUE', name: 'Alhué', zone: 'RM' },
      { code: 'CURACAVI', name: 'Curacaví', zone: 'RM' },
      { code: 'MARIA_PINTO', name: 'María Pinto', zone: 'RM' },
      { code: 'SAN_PEDRO', name: 'San Pedro', zone: 'RM' },
      { code: 'TALAGANTE', name: 'Talagante', zone: 'RM' },
      { code: 'EL_MONTE', name: 'El Monte', zone: 'RM' },
      { code: 'ISLA_DE_MAIPO', name: 'Isla de Maipo', zone: 'RM' },
      { code: 'PADRE_HURTADO', name: 'Padre Hurtado', zone: 'RM' },
      { code: 'PENAFLOR', name: 'Peñaflor', zone: 'RM' },
    ],
  },
  {
    code: 'VI',
    name: "Región del Libertador Gral. Bernardo O'Higgins",
    shortName: "O'Higgins",
    zone: 'CENTRO',
    communes: [
      { code: 'RANCAGUA', name: 'Rancagua', zone: 'CENTRO' },
      { code: 'MACHALI', name: 'Machalí', zone: 'CENTRO' },
      { code: 'GRANEROS', name: 'Graneros', zone: 'CENTRO' },
      { code: 'CODEGUA', name: 'Codegua', zone: 'CENTRO' },
      { code: 'MOSTAZAL', name: 'San Francisco de Mostazal', zone: 'CENTRO' },
      { code: 'REQUINOA', name: 'Requínoa', zone: 'CENTRO' },
      { code: 'RENGO', name: 'Rengo', zone: 'CENTRO' },
      { code: 'SAN_FERNANDO', name: 'San Fernando', zone: 'CENTRO' },
      { code: 'SANTA_CRUZ', name: 'Santa Cruz', zone: 'CENTRO' },
      { code: 'PICHILEMU', name: 'Pichilemu', zone: 'CENTRO' },
      { code: 'CHEPICA', name: 'Chépica', zone: 'CENTRO' },
      { code: 'CHIMBARONGO', name: 'Chimbarongo', zone: 'CENTRO' },
      { code: 'COLTAUCO', name: 'Coltauco', zone: 'CENTRO' },
      { code: 'DONIHUE', name: 'Doñihue', zone: 'CENTRO' },
      { code: 'LAS_CABRAS', name: 'Las Cabras', zone: 'CENTRO' },
      { code: 'MALLOA', name: 'Malloa', zone: 'CENTRO' },
      { code: 'NAVIDAD', name: 'Navidad', zone: 'CENTRO' },
      { code: 'PEUMO', name: 'Peumo', zone: 'CENTRO' },
      { code: 'PICHIDEGUA', name: 'Pichidegua', zone: 'CENTRO' },
      { code: 'SAN_VICENTE', name: 'San Vicente de Tagua Tagua', zone: 'CENTRO' },
    ],
  },
  {
    code: 'VII',
    name: 'Región del Maule',
    shortName: 'Maule',
    zone: 'CENTRO',
    communes: [
      { code: 'TALCA', name: 'Talca', zone: 'CENTRO' },
      { code: 'CURICO', name: 'Curicó', zone: 'CENTRO' },
      { code: 'LINARES', name: 'Linares', zone: 'CENTRO' },
      { code: 'CONSTITUCION', name: 'Constitución', zone: 'CENTRO' },
      { code: 'CAUQUENES', name: 'Cauquenes', zone: 'CENTRO' },
      { code: 'PARRAL', name: 'Parral', zone: 'CENTRO' },
      { code: 'SAN_JAVIER', name: 'San Javier', zone: 'CENTRO' },
      { code: 'MOLINA', name: 'Molina', zone: 'CENTRO' },
      { code: 'SAN_CLEMENTE', name: 'San Clemente', zone: 'CENTRO' },
      { code: 'LONGAVI', name: 'Longaví', zone: 'CENTRO' },
      { code: 'TENO', name: 'Teno', zone: 'CENTRO' },
    ],
  },
  {
    code: 'XVI',
    name: 'Región de Ñuble',
    shortName: 'Ñuble',
    zone: 'SUR',
    communes: [
      { code: 'CHILLAN', name: 'Chillán', zone: 'SUR' },
      { code: 'CHILLAN_VIEJO', name: 'Chillán Viejo', zone: 'SUR' },
      { code: 'SAN_CARLOS', name: 'San Carlos', zone: 'SUR' },
      { code: 'BULNES', name: 'Bulnes', zone: 'SUR' },
      { code: 'YUNGAY', name: 'Yungay', zone: 'SUR' },
      { code: 'COELEMU', name: 'Coelemu', zone: 'SUR' },
      { code: 'QUILLON', name: 'Quillón', zone: 'SUR' },
      { code: 'SAN_NICOLAS', name: 'San Nicolás', zone: 'SUR' },
    ],
  },
  {
    code: 'VIII',
    name: 'Región del Biobío',
    shortName: 'Biobío',
    zone: 'SUR',
    communes: [
      { code: 'CONCEPCION', name: 'Concepción', zone: 'SUR' },
      { code: 'TALCAHUANO', name: 'Talcahuano', zone: 'SUR' },
      { code: 'SAN_PEDRO_DE_LA_PAZ', name: 'San Pedro de la Paz', zone: 'SUR' },
      { code: 'CHIGUAYANTE', name: 'Chiguayante', zone: 'SUR' },
      { code: 'CORONEL', name: 'Coronel', zone: 'SUR' },
      { code: 'LOTA', name: 'Lota', zone: 'SUR' },
      { code: 'HUALPEN', name: 'Hualpén', zone: 'SUR' },
      { code: 'PENCO', name: 'Penco', zone: 'SUR' },
      { code: 'TOME', name: 'Tomé', zone: 'SUR' },
      { code: 'LOS_ANGELES', name: 'Los Ángeles', zone: 'SUR' },
      { code: 'ARAUCO', name: 'Arauco', zone: 'SUR' },
      { code: 'LEBU', name: 'Lebu', zone: 'SUR' },
      { code: 'CANETE', name: 'Cañete', zone: 'SUR' },
    ],
  },
  {
    code: 'IX',
    name: 'Región de La Araucanía',
    shortName: 'La Araucanía',
    zone: 'SUR',
    communes: [
      { code: 'TEMUCO', name: 'Temuco', zone: 'SUR' },
      { code: 'PADRE_LAS_CASAS', name: 'Padre Las Casas', zone: 'SUR' },
      { code: 'VILLARRICA', name: 'Villarrica', zone: 'SUR' },
      { code: 'PUCON', name: 'Pucón', zone: 'SUR' },
      { code: 'ANGOL', name: 'Angol', zone: 'SUR' },
      { code: 'VICTORIA', name: 'Victoria', zone: 'SUR' },
      { code: 'LAUTARO', name: 'Lautaro', zone: 'SUR' },
      { code: 'NUEVA_IMPERIAL', name: 'Nueva Imperial', zone: 'SUR' },
      { code: 'PITRUFQUEN', name: 'Pitrufquén', zone: 'SUR' },
    ],
  },
  {
    code: 'XIV',
    name: 'Región de Los Ríos',
    shortName: 'Los Ríos',
    zone: 'SUR',
    communes: [
      { code: 'VALDIVIA', name: 'Valdivia', zone: 'SUR' },
      { code: 'LA_UNION', name: 'La Unión', zone: 'SUR' },
      { code: 'RIO_BUENO', name: 'Río Bueno', zone: 'SUR' },
      { code: 'PANGUIPULLI', name: 'Panguipulli', zone: 'SUR' },
      { code: 'LOS_LAGOS', name: 'Los Lagos', zone: 'SUR' },
      { code: 'PAILLACO', name: 'Paillaco', zone: 'SUR' },
      { code: 'MARIQUINA', name: 'Mariquina', zone: 'SUR' },
    ],
  },
  {
    code: 'X',
    name: 'Región de Los Lagos',
    shortName: 'Los Lagos',
    zone: 'SUR',
    communes: [
      { code: 'PUERTO_MONTT', name: 'Puerto Montt', zone: 'SUR' },
      { code: 'PUERTO_VARAS', name: 'Puerto Varas', zone: 'SUR' },
      { code: 'OSORNO', name: 'Osorno', zone: 'SUR' },
      { code: 'CASTRO', name: 'Castro', zone: 'SUR' },
      { code: 'ANCUD', name: 'Ancud', zone: 'SUR' },
      { code: 'QUELLON', name: 'Quellón', zone: 'SUR' },
      { code: 'CALBUCO', name: 'Calbuco', zone: 'SUR' },
      { code: 'FRUTILLAR', name: 'Frutillar', zone: 'SUR' },
      { code: 'LLANQUIHUE', name: 'Llanquihue', zone: 'SUR' },
    ],
  },
  {
    code: 'XI',
    name: 'Región de Aysén',
    shortName: 'Aysén',
    zone: 'EXTREMO_SUR',
    communes: [
      { code: 'COYHAIQUE', name: 'Coyhaique', zone: 'EXTREMO_SUR' },
      { code: 'PUERTO_AYSEN', name: 'Puerto Aysén', zone: 'EXTREMO_SUR' },
      { code: 'CHILE_CHICO', name: 'Chile Chico', zone: 'EXTREMO_SUR' },
      { code: 'COCHRANE', name: 'Cochrane', zone: 'EXTREMO_SUR' },
    ],
  },
  {
    code: 'XII',
    name: 'Región de Magallanes y de la Antártica Chilena',
    shortName: 'Magallanes',
    zone: 'EXTREMO_SUR',
    communes: [
      { code: 'PUNTA_ARENAS', name: 'Punta Arenas', zone: 'EXTREMO_SUR' },
      { code: 'PUERTO_NATALES', name: 'Puerto Natales', zone: 'EXTREMO_SUR' },
      { code: 'PORVENIR', name: 'Porvenir', zone: 'EXTREMO_SUR' },
      { code: 'CABO_DE_HORNOS', name: 'Cabo de Hornos', zone: 'EXTREMO_SUR' },
    ],
  },
];

export async function seedLocations(prisma: PrismaClient) {
  console.log('--- Seeding Zonas Logísticas ---');
  for (const zone of INITIAL_LOGISTIC_ZONES) {
    await prisma.logisticZone.upsert({
      where: { code: zone.code },
      update: { name: zone.name, description: zone.description },
      create: {
        code: zone.code,
        name: zone.name,
        description: zone.description,
        isActive: true,
      },
    });
  }

  const zones = await prisma.logisticZone.findMany();
  const zoneMap = new Map<string, string>();
  zones.forEach((z) => zoneMap.set(z.code, z.id));
  const defaultZoneId = zoneMap.get('CENTRO') || zones[0]?.id;

  console.log('--- Seeding Regiones y Comunas de Chile ---');
  let ordinal = 1;
  for (const reg of CHILE_REGIONS) {
    const regionZoneId = zoneMap.get(reg.zone) || defaultZoneId;

    const region = await prisma.region.upsert({
      where: { code: reg.code },
      update: {
        name: reg.name,
        shortName: reg.shortName,
        zoneId: regionZoneId,
        ordinal: ordinal++,
      },
      create: {
        code: reg.code,
        name: reg.name,
        shortName: reg.shortName,
        zoneId: regionZoneId,
        ordinal: ordinal++,
        isActive: true,
      },
    });

    for (const com of reg.communes) {
      const communeZoneId = zoneMap.get(com.zone) || regionZoneId || defaultZoneId;
      await prisma.commune.upsert({
        where: { code: com.code },
        update: {
          name: com.name,
          regionId: region.id,
          zoneId: communeZoneId,
        },
        create: {
          code: com.code,
          name: com.name,
          regionId: region.id,
          zoneId: communeZoneId,
          isActive: true,
        },
      });
    }
  }

  console.log('--- Vinculando Tiendas Huérfanas de Ubicación ---');
  const storesWithoutRelations = await prisma.store.findMany({
    where: {
      OR: [{ originCommuneId: null }, { originRegionId: null }],
    },
  });

  if (storesWithoutRelations.length > 0) {
    const santiago = await prisma.commune.findUnique({
      where: { code: 'SANTIAGO' },
      include: { region: true },
    });
    if (santiago) {
      for (const store of storesWithoutRelations) {
        await prisma.store.update({
          where: { id: store.id },
          data: {
            originCommuneId: santiago.id,
            originRegionId: santiago.regionId,
          },
        });
      }
    }
  }
}
