"use client";
import { API_URL } from "@/utils/api";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { useProductCart } from "@/hooks/useProductCart";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { IconEye, IconHeart } from "@/components/ui/Icons";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const t = useTranslations("shop");
  const tw = useTranslations("wishlist");

  const dispatch = useDispatch<AppDispatch>();
  const { handleAddToCart, isMaxStockReached } = useProductCart(item);
  const { showToast } = useToast();
  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);
  const currency = useAppSelector((state: any) => state.currencyReducer);

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleItemToWishList = async () => {
    const wishItem = {
      id: item.id,
      title: item.title || item.name,
      price: item.price || 0,
      discountedPrice: item.discountedPrice || 0,
      quantity: 1,
      status: "available",
      imgs: item.imgs || {
        thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
        previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
      },
    };

    dispatch(addItemToWishlist(wishItem));
    showToast(tw("added", { title: wishItem.title }), "info");
    if (isAuthenticated) {
      try {
        await fetch(`${API_URL}/wishlist/${item.id}`, { method: 'POST', credentials: 'include' });
      } catch (e) { }
    }
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] shadow-1 min-h-[300px] mb-4">
        <Image
          src={item.imgs?.previews?.[0] || item.imageUrl || "/images/products/product-1-bg-1.png"}
          alt={item.title || item.name || "Product"}
          width={250}
          height={350}
          className="object-contain h-full w-full max-w-[220px]"
          priority={false}
          unoptimized={Boolean((item.imgs?.previews?.[0] || item.imageUrl)?.includes("scryfall"))}
          referrerPolicy="no-referrer"
        />

        {/* Out of Stock Overlay */}
        {(item.stock === 0 || (item.items && item.items.length > 0 && item.items.every(i => i.stock === 0))) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-white font-semibold text-lg bg-red px-4 py-1.5 rounded-[5px] shadow-sm">
              {t("outOfStock")}
            </span>
          </div>
        )}

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0 z-20">


          <Link
            href={`/shop-details/${item.slug}`}
            aria-label={t("view_sellers_aria")}
            id="addCartOne"
            className="flex items-center justify-center w-9 h-9 rounded-lg shadow-sm ease-out duration-200 text-[var(--tt-text-main)] bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:text-white hover:bg-red"
          >
            <IconEye className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleItemToWishList()}
            aria-label={t("add_favorite_aria")}
            id="favOne"
            className="flex items-center justify-center w-9 h-9 rounded-lg shadow-sm ease-out duration-200 text-[var(--tt-text-main)] bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:text-red"
          >
            <IconHeart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
          />
        </div>

        <p className="text-custom-sm text-[var(--tt-text-muted)]">({item.reviews})</p>
      </div>

      <h3 className="font-medium text-[var(--tt-text-main)] ease-out duration-200 hover:text-red mb-1.5">
        <Link href={`/shop-details/${item.slug}`}> {item.title || item.name} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        {(item.price ?? 0) > 0 ? (
          <span className="text-[var(--tt-text-main)] font-bold">{formatPrice(item.discountedPrice ?? item.price ?? 0, currency)}</span>
        ) : (
          <span className="text-[var(--tt-text-muted)] text-sm italic">{t("noPrice")}</span>
        )}
      </span>
    </div>
  );
};

export default SingleGridItem;
