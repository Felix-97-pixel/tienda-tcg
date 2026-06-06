import React from "react";

const Categories = ({ categories }) => {
  return (
    <div className="shadow-1 bg-[#1a1d24] rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-white/10">
        <h2 className="font-medium text-lg text-white">Popular Category</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <button className="group flex items-center justify-between ease-out duration-200 text-white hover:text-blue">
            Desktop
            <span className="inline-flex rounded-[30px] bg-[#222630] text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
              12
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
