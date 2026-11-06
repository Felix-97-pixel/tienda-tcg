"use client";
import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import { useProductCart } from "@/hooks/useProductCart";
import { useToast } from "@/hooks/useToast";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import { useTranslations } from "next-intl";
import { IconEye, IconHeart } from "@/components/ui/Icons";

const ProductItem = ({ item }: { item: Product }) => {
  const t = useTranslations("shop");
  const tw = useTranslations("wishlist");
  const { openModal } = useModalContext();

  const dispatch = useDispatch<AppDispatch>();
  const { handleAddToCart, isMaxStockReached } = useProductCart(item);
  const { showToast } = useToast();
  const currency = useAppSelector((state: any) => state.currencyReducer);

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleItemToWishList = () => {
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
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-[#F6F7FB] min-h-[270px] mb-4">
        <Image 
          className="object-contain h-full w-full" 
          src={item.imgs?.previews?.[0] || item.imageUrl || "/images/products/product-1-bg-1.png"} 
          alt={item.title || item.name} 
          width={250} 
          height={250} 
          unoptimized={Boolean((item.imgs?.previews?.[0] || item.imageUrl)?.includes("scryfall"))}
        />

        {/* Out of Stock Overlay */}
        {(item.stock === 0 || (item.items && item.items.length > 0 && item.items.every(i => i.stock === 0))) && (
          <div className="absolute inset-0 bg-dark/40 flex items-center justify-center z-10">
            <span className="text-white font-semibold text-lg bg-red px-4 py-1.5 rounded-[5px] shadow-sm">
              {t("outOfStock")}
            </span>
          </div>
        )}

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0 z-20">

          <Link
            href={`/shop-details/${item.slug || item.id}`}
            onClick={() => handleProductDetails()}
            aria-label={t("view_sellers_aria")}
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-white bg-[#1a1d24] hover:text-white hover:bg-blue"
          >
            <IconEye className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleItemToWishList()}
            aria-label={t("add_favorite_aria")}
            id="favOne"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-white bg-[#1a1d24] hover:text-blue"
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
            width={14}
            height={14}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={14}
            height={14}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={14}
            height={14}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={14}
            height={14}
          />
          <Image className="w-auto h-auto"
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={14}
            height={14}
          />
        </div>

        <p className="text-custom-sm">({item.reviews})</p>
      </div>

      <h3
        className="font-medium text-white ease-out duration-200 hover:text-blue mb-1.5"
        onClick={() => handleProductDetails()}
      >
        <Link href={`/shop-details/${item.slug || item.id}`}> {item.title || item.name} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        {(item.price ?? 0) > 0 ? (
          <>
            <span className="text-white">{formatPrice(item.discountedPrice ?? item.price ?? 0, currency)}</span>
            {item.discountedPrice && item.discountedPrice < (item.price ?? 0) && (
              <span className="text-gray-4 line-through">{formatPrice(item.price ?? 0, currency)}</span>
            )}
          </>
        ) : (
          <span className="text-gray-4 text-sm italic">{t("noPrice")}</span>
        )}
      </span>
    </div>
  );
};

export default ProductItem;
