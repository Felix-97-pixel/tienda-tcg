-- Corrige la función trigger log_market_price_history para evitar colisiones
-- con la restricción de clave única @@unique([marketPriceId, date]) en MarketPriceHistory
-- cuando se actualiza más de un precio en el mismo día.

CREATE OR REPLACE FUNCTION public.log_market_price_history()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO "MarketPriceHistory" ("id", "marketPriceId", "price", "date", "createdAt")
        VALUES (gen_random_uuid()::text, NEW."id", NEW."price", CURRENT_DATE, NOW())
        ON CONFLICT ("marketPriceId", "date")
        DO UPDATE SET "price" = EXCLUDED."price";
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW."price" <> OLD."price") THEN
            INSERT INTO "MarketPriceHistory" ("id", "marketPriceId", "price", "date", "createdAt")
            VALUES (gen_random_uuid()::text, NEW."id", NEW."price", CURRENT_DATE, NOW())
            ON CONFLICT ("marketPriceId", "date")
            DO UPDATE SET "price" = EXCLUDED."price";
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$function$;

