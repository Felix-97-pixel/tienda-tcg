import React from "react";

const Coupon = () => {
  return (
    <div className="bg-[#1a1d24] shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-white/10 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-white">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            placeholder="Enter coupon code"
            className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />

          <button
            type="submit"
            className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
