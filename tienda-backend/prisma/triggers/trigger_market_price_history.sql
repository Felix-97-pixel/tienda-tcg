-- Este archivo contiene la creación de la función y el Trigger para el historial de precios.
-- Prisma no soporta Triggers de forma nativa en schema.prisma, por lo que este SQL se debe 
-- ejecutar manualmente (o mediante una migración custom de Prisma) si la base de datos se borra por completo.

CREATE OR REPLACE FUNCTION log_market_price_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO "MarketPriceHistory" ("id", "marketPriceId", "price", "createdAt")
        VALUES (gen_random_uuid()::text, NEW."id", NEW."price", NOW());
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW."price" <> OLD."price") THEN
            INSERT INTO "MarketPriceHistory" ("id", "marketPriceId", "price", "createdAt")
            VALUES (gen_random_uuid()::text, NEW."id", NEW."price", NOW());
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Si alguna vez falla por intentar crearlo dos veces, puedes descomentar la siguiente línea:
-- DROP TRIGGER IF EXISTS trigger_market_price_history ON "MarketPrice";

CREATE TRIGGER trigger_market_price_history
AFTER INSERT OR UPDATE ON "MarketPrice"
FOR EACH ROW
EXECUTE FUNCTION log_market_price_history();
