ALTER TABLE "CardDetail" ALTER COLUMN "game" TYPE TEXT USING "game"::text;
DROP TYPE "GameType";

ALTER TABLE "WishlistItem" DROP COLUMN "id";
ALTER TABLE "WishlistItem" ADD PRIMARY KEY ("userId", "productId");
