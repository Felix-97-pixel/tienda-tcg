"use client";
import { API_URL } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";

export const Wishlist = () => {
  const reduxWishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);
  const [dbItems, setDbItems] = useState<any[]>([]);

  const fetchWishlist = async () => {
    try {
      
      const res = await fetch(`${API_URL}/wishlist`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          price: item.items?.[0]?.price || 0,
          discountedPrice: item.items?.[0]?.price || 0,
          stock: item.items?.[0]?.stock || 0,
          quantity: 1,
          status: (item.items?.[0]?.stock || 0) > 0 ? "In Stock" : "Out of Stock",
          imgs: {
            thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
            previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
          }
        }));
        setDbItems(mapped);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const wishlistItems = isAuthenticated ? dbItems : reduxWishlistItems;

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-[#222630]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-white text-2xl">Your Wishlist</h2>
            <button className="text-blue">Clear Wishlist Cart</button>
          </div>

          <div className="bg-[#1a1d24] rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-white">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-white">Unit Price</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-white">Stock Status</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-white text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item, key) => (
                  <SingleItem item={item} key={key} onRemove={isAuthenticated ? fetchWishlist : undefined} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
