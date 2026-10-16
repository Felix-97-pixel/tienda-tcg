import React from "react";
import { Wishlist } from "@/app/(site)/(pages)/wishlist/_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Lista de Deseos (Wishlist) | TapTrade TCG Marketplace",
  description: "Guarda, organiza y monitorea cartas de Magic: The Gathering, Pokémon, One Piece y Yu-Gi-Oh! en tu Wishlist de TapTrade.",
};

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
