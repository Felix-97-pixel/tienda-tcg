"use client";
import { API_URL } from "@/utils/api";
import { useEffect, useState, useMemo } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { useProductCart } from "@/hooks/useProductCart";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";
import {
  IconX,
  IconSearch,
  IconStarFilled,
  IconCheckCircle,
  IconXCircle,
  IconMinus,
  IconPlus,
  IconHeart,
} from "@/components/ui/Icons";

import { formatPrice } from "@/utils/currency";

const QuickViewModal = () => {
  const t = useTranslations("shop");
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);
  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);
  const currency = useAppSelector((state: any) => state.currencyReducer);

  const dispatch = useDispatch<AppDispatch>();

  // get the product data
  const originalProduct = useAppSelector((state) => state.quickViewReducer.value);
  const isTcgProduct = !!originalProduct?.cardDetail || originalProduct?.category?.isTcg === true;

  const getLangName = (i: any) => i.language?.name || (typeof i.language === 'string' ? i.language : null);
  const getFinishName = (i: any) => i.finish?.name || (typeof i.finish === 'string' ? i.finish : null);
  const getCondName = (i: any) => i.condition_rel?.displayName || i.condition_rel?.name || i.condition?.displayName || i.condition?.name || (typeof i.condition === 'string' ? i.condition : null);

  const availableLanguages = useMemo(() => Array.from(new Set(originalProduct.items?.filter((i: any) => i.stock > 0).map(getLangName).filter(Boolean))) as string[], [originalProduct]);
  const availableFinishes = useMemo(() => Array.from(new Set(originalProduct.items?.filter((i: any) => i.stock > 0).map(getFinishName).filter(Boolean))) as string[], [originalProduct]);

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const availableConditions = useMemo(() => {
    if (!originalProduct?.items) return [];
    let items = originalProduct.items.filter((i: any) => i.stock > 0);

    if (selectedLanguage) {
      items = items.filter((i: any) => getLangName(i) === selectedLanguage);
    }
    if (selectedFinish) {
      items = items.filter((i: any) => getFinishName(i) === selectedFinish);
    }

    return Array.from(new Set(items.map(getCondName).filter(Boolean))) as string[];
  }, [originalProduct, selectedLanguage, selectedFinish]);

  useEffect(() => {
    if (availableConditions.length > 0 && selectedCondition && !availableConditions.includes(selectedCondition)) {
      setSelectedCondition(availableConditions[0]);
    }
  }, [availableConditions, selectedCondition]);

  useEffect(() => {
    if (originalProduct?.items && originalProduct.items.length > 0) {
      const firstWithStock = originalProduct.items.find((i: any) => i.stock > 0) || originalProduct.items[0];
      setSelectedLanguage(getLangName(firstWithStock));
      setSelectedFinish(getFinishName(firstWithStock));
      setSelectedCondition(getCondName(firstWithStock));
    }
  }, [originalProduct]);

  const selectedItem = useMemo(() => {
    if (!originalProduct?.items) return null;
    return originalProduct.items.find((i: any) => 
      getLangName(i) === selectedLanguage &&
      getFinishName(i) === selectedFinish &&
      getCondName(i) === selectedCondition
    ) || null;
  }, [originalProduct, selectedLanguage, selectedFinish, selectedCondition]);

  const product = useMemo(() => {
    if (!selectedItem) return originalProduct;
    return {
      ...originalProduct,
      price: selectedItem.price,
      discountedPrice: selectedItem.price,
      stock: selectedItem.stock,
      inventoryItemId: selectedItem.id,
    };
  }, [originalProduct, selectedItem]);

  const { handleAddToCart: addToCart, isMaxStockReached, availableStock } = useProductCart(product);
  const { showToast } = useToast();

  const tw = useTranslations("wishlist");
  const tc = useTranslations("cart");

  const [activePreview, setActivePreview] = useState(0);

  // preview modal
  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));

    openPreviewModal();
  };

  // add to cart
  const handleAddToCart = () => {
    addToCart(quantity);
    closeModal();
  };

  const handleItemToWishList = async () => {
    const wishItem = {
      id: product.id,
      title: product.title || product.name,
      price: product.price || 0,
      discountedPrice: product.discountedPrice || 0,
      quantity: 1,
      status: "available",
      imgs: product.imgs || {
        thumbnails: [product.imageUrl || "/images/products/product-1-bg-1.png"],
        previews: [product.imageUrl || "/images/products/product-1-bg-1.png"],
      },
    };
    dispatch(addItemToWishlist(wishItem));
    showToast(tw("added", { title: wishItem.title }), "info");
    if (isAuthenticated) {
      try {
        await fetch(`${API_URL}/wishlist/${product.id}`, { method: 'POST', credentials: 'include' });
      } catch (e) { }
    }
  };

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      setQuantity(1);
    };
  }, [isModalOpen, closeModal]);

  return (
    <div
      className={`${isModalOpen ? "z-99999" : "hidden"
        } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-[#1a1d24] p-7.5 relative modal-content">
          <button
            onClick={() => closeModal()}
            aria-label={t("close_modal_aria")}
            className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-white"
          >
            <IconX className="w-6 h-6" />
          </button>

          <div className="flex flex-wrap items-center gap-12.5">
            <div className="max-w-[526px] w-full">
              <div className="flex gap-5">
                <div className="flex flex-col gap-5">
                  {product.imgs?.thumbnails?.map((img, key) => (
                    <button
                      onClick={() => setActivePreview(key)}
                      key={key}
                      className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-[#111318] ease-out duration-200 hover:border-2 hover:border-blue ${activePreview === key && "border-2 border-blue"
                        }`}
                    >
                      <Image
                        src={img || ""}
                        alt="thumbnail"
                        width={61}
                        height={61}
                        className="w-auto h-auto aspect-square"
                        unoptimized={Boolean(typeof img === 'string' && img.includes("scryfall"))}
                      />
                    </button>
                  ))}
                </div>

                <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[508px] bg-[#111318] rounded-lg border border-white/10">
                  <div>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label={t("zoom_aria")}
                      className="gallery__Image w-10 h-10 rounded-[5px] bg-[#1a1d24] shadow-1 flex items-center justify-center ease-out duration-200 text-white hover:text-blue absolute top-4 lg:top-8 right-4 lg:right-8 z-50"
                    >
                      <IconSearch className="w-5 h-5" />
                    </button>

                    {product?.imgs?.previews?.[activePreview] && (
                      <Image className="w-auto h-auto"
                        src={product.imgs.previews[activePreview]}
                        alt="products-details"
                        width={400}
                        height={400}
                        unoptimized={Boolean(typeof product.imgs.previews[activePreview] === 'string' && product.imgs.previews[activePreview].includes("scryfall"))}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-[445px] w-full">
              <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-green mb-6.5">
                {t("sale_20_off")}
              </span>

              <h3 className="font-semibold text-xl xl:text-heading-5 text-white mb-4">
                {product.title}
              </h3>

              <div className="flex flex-wrap items-center gap-5 mb-6">
                <div className="flex items-center gap-1.5">
                  {/* <!-- stars --> */}
                  <div className="flex items-center gap-1">
                    <IconStarFilled className="w-[18px] h-[18px] text-[#FFA645]" />
                    <IconStarFilled className="w-[18px] h-[18px] text-[#FFA645]" />
                    <IconStarFilled className="w-[18px] h-[18px] text-[#FFA645]" />
                    <IconStarFilled className="w-[18px] h-[18px] text-gray-4" />
                    <IconStarFilled className="w-[18px] h-[18px] text-gray-4" />
                  </div>

                  <span>
                    <span className="font-medium text-white"> 4.7 {t("rating")} </span>
                    <span className="text-gray-2"> (5 {t("reviews")}) </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {product?.stock === 0 ? (
                    <>
                      <IconXCircle className="w-5 h-5 text-red" />
                      <span className="font-medium text-red"> {t("outOfStock")} </span>
                    </>
                  ) : (
                    <>
                      <IconCheckCircle className="w-5 h-5 text-[#22AD5C]" />
                      <span className="font-medium text-white"> {t("inStock")} </span>
                    </>
                  )}
                </div>
              </div>

              {product?.description && (
                <p className="whitespace-pre-line text-sm text-gray-4">
                  {product.description}
                </p>
              )}

              {isTcgProduct && (availableLanguages.length > 0 || availableFinishes.length > 0 || availableConditions.length > 0) && (
                <div className="grid grid-cols-12 gap-3 mt-6 border-t border-stroke pt-5">
                  {availableLanguages.length > 0 && (
                    <div className="col-span-6 sm:col-span-4 flex flex-col">
                      <label className="text-sm font-medium mb-2 text-white truncate" title={t("language_label")}>{t("language_label")}</label>
                      <Select
                        value={selectedLanguage || ""}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        options={availableLanguages.map((l) => ({ value: l, label: l }))}
                      />
                    </div>
                  )}
                  {availableFinishes.length > 0 && (
                    <div className="col-span-6 sm:col-span-4 flex flex-col">
                      <label className="text-sm font-medium mb-2 text-white truncate" title={t("finish_title")}>{t("finish_label")}</label>
                      <Select
                        value={selectedFinish || ""}
                        onChange={(e) => setSelectedFinish(e.target.value)}
                        options={availableFinishes.map((f) => ({ value: f, label: f }))}
                      />
                    </div>
                  )}
                  {availableConditions.length > 0 && (
                    <div className="col-span-6 sm:col-span-4 flex flex-col">
                      <label className="text-sm font-medium mb-2 text-white truncate" title={t("filter_condition_title")}>{t("filter_condition_title")}</label>
                      <Select
                        value={selectedCondition || ""}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                        options={availableConditions.map((c) => ({ value: c, label: c }))}
                      />
                    </div>
                  )}
                </div>
              )}

              {isTcgProduct && originalProduct?.items?.length > 0 && !selectedItem && (
                <p className="text-red font-medium mt-4">{t("combination_not_available")}</p>
              )}

              <div className="flex flex-wrap justify-between gap-5 mt-6 mb-7.5">
                <div>
                  <h4 className="font-semibold text-lg text-white mb-3.5">
                    {tc("price")}
                  </h4>

                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xl xl:text-heading-4">
                      {formatPrice(product.discountedPrice || product.price, currency)}
                    </span>
                    {product.discountedPrice < product.price && (
                      <span className="font-medium text-gray-4 text-lg xl:text-2xl line-through">
                        {formatPrice(product.price, currency)}
                      </span>
                    )}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-white mb-3.5">
                    {tc("quantity")}
                  </h4>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      aria-label={t("decrease_qty_aria")}
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-[#222630] text-white ease-out duration-200 hover:text-blue"
                      disabled={quantity <= 1 || product?.stock === 0}
                    >
                      <IconMinus className="w-4 h-4" />
                    </button>

                    <span
                      className="flex items-center justify-center w-20 h-10 rounded-[5px] border border-white/20 bg-[#1a1d24] font-medium text-white"
                      x-text="quantity"
                    >
                      {quantity}
                    </span>

                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label={t("increase_qty_aria")}
                      className={`flex items-center justify-center w-10 h-10 rounded-[5px] bg-[#222630] ease-out duration-200 ${product?.stock === 0 || quantity >= availableStock
                          ? "text-gray-4 cursor-not-allowed"
                          : "text-white hover:text-blue"
                        }`}
                      disabled={product?.stock === 0 || quantity >= availableStock}
                    >
                      <IconPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product?.stock === 0 || isMaxStockReached || (isTcgProduct && originalProduct?.items?.length > 0 && !selectedItem)}
                  className={`inline-flex py-3 px-6 rounded-md ease-out duration-200 ${product?.stock === 0 || isMaxStockReached || (isTcgProduct && originalProduct?.items?.length > 0 && !selectedItem)
                      ? "bg-gray-4 cursor-not-allowed text-gray-4"
                      : "text-white bg-blue hover:bg-blue-dark"
                    }`}
                >
                  {product?.stock === 0 ? t("outOfStock") : (isMaxStockReached ? t("maxReached") : t("addToCart"))}
                </button>

                <button
                  onClick={handleItemToWishList}
                  className={`inline-flex items-center gap-2 font-medium text-white bg-dark py-3 px-6 rounded-md ease-out duration-200 hover:bg-opacity-95 `}
                >
                  <IconHeart className="w-5 h-5" />
                  {t("addToWishlist")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
