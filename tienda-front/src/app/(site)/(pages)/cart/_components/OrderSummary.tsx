import { selectTotalPrice, selectTotalDiscount, selectCartItemsWithDiscounts } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { formatPrice } from "@/utils/currency";

const OrderSummary = () => {
  const cartItems = useSelector(selectCartItemsWithDiscounts);
  const totalPrice = useSelector(selectTotalPrice);
  const totalDiscount = useSelector(selectTotalDiscount);
  const currency = useSelector((state: any) => state.currencyReducer);

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* <!-- order list box --> */}
      <div className="bg-[#1a1d24] shadow-1 rounded-[10px]">
        <div className="border-b border-white/10 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-white">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-white/10">
            <div>
              <h4 className="font-medium text-white">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-white text-right">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartItems.map((item, key) => (
            <div key={key} className="flex items-center justify-between py-5 border-b border-white/10">
              <div>
                <p className="text-white">{item.title}</p>
              </div>
              <div className="flex flex-col items-end">
                {item.discountAmount > 0 && (
                  <p className="text-gray-5 line-through text-xs">{formatPrice(item.originalPrice * item.quantity, currency)}</p>
                )}
                <p className="text-white text-right">
                  {formatPrice((item.finalPrice || item.discountedPrice || item.price) * item.quantity, currency)}
                </p>
              </div>
            </div>
          ))}

          {/* <!-- Savings --> */}
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between pt-5 border-b border-white/10 pb-5">
              <div>
                <p className="font-medium text-green-400">Ahorro Cupones</p>
              </div>
              <div>
                <p className="font-medium text-green-400 text-right">
                  -{formatPrice(totalDiscount, currency)}
                </p>
              </div>
            </div>
          )}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-white">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-white text-right">
                {formatPrice(totalPrice, currency)}
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <Link
            href="/checkout"
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
          >
            Process to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
