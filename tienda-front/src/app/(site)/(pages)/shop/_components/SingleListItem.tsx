"use client";
import { API_URL } from "@/utils/api";
import React from "react";

import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { useProductCart } from "@/hooks/useProductCart";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { IconEye, IconHeart } from "@/components/ui/Icons";

const SingleListItem = ({ item }: { item: Product }) => {
  const t = useTranslations("shop");
  const tw = useTranslations("wishlist");
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { handleAddToCart, isMaxStockReached } = useProductCart(item);
  const { showToast } = useToast();

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);

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
      } catch (e) {}
    }
  };

  return (
    <div className="group rounded-lg bg-[#1a1d24] shadow-1">
      <div className="flex">
        <div className="shadow-list relative overflow-hidden flex items-center justify-center max-w-[270px] w-full sm:min-h-[300px] p-4">
          <Image  
            src={item.imgs?.previews?.[0] || item.imageUrl || "/images/products/product-1-bg-1.png"} 
            alt={item.title || item.name || "Product"} 
            width={250} 
            height={350} 
            className="object-contain h-full w-full max-w-[200px]" 
            priority={false}
            unoptimized={Boolean((item.imgs?.previews?.[0] || item.imageUrl)?.includes("scryfall"))}
            referrerPolicy="no-referrer"
          />

          {/* Out of Stock Overlay */}
          {item.stock === 0 && (
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
              aria-label={t("view_stores")}
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-white bg-[#1a1d24] hover:text-white hover:bg-blue"
            >
              <IconEye className="w-4 h-4" />
            </Link>

            <button
              onClick={() => handleItemToWishList()}
              aria-label={t("add_favorite_aria")}
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-white bg-[#1a1d24] hover:text-blue"
            >
              <IconHeart className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col gap-5 sm:flex-row sm:items-center justify-center sm:justify-between py-5 px-4 sm:px-7.5 lg:pl-11 lg:pr-12">
          <div>
            <h3 className="font-medium text-white ease-out duration-200 hover:text-blue mb-1.5">
              <Link href={`/shop-details/${item.slug || item.id}`}> {item.title || item.name} </Link>
            </h3>

            <span className="flex items-center gap-2 font-medium text-lg">
              {item.price > 0 ? (
                <span className="text-white">${item.discountedPrice ?? item.price ?? 0}
                {item.discountedPrice && item.discountedPrice < (item.price ?? 0) && (
                  <span className="text-gray-4 line-through ml-2">${item.price}</span>
                )}
                <span className="text-xs font-normal text-gray-4">USD · CK</span></span>
              ) : (
                <span className="text-gray-4 text-sm italic">{t("noPrice")}</span>
              )}
            </span>
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

            <p className="text-custom-sm">({item.reviews})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
