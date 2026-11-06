"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/store";
import { useWishlist } from "@/app/admin/_components/Wishlist/hooks/useWishlist";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { IconFlame, IconHeart } from "@/components/ui/Icons";

export default function AdminWishlist() {
  const t = useTranslations("admin.wishlist");
  const { features } = useAppSelector((state) => state.adminAuthReducer);
  const { loading, filter, setFilter, kpis, filteredProducts } = useWishlist();

  const { totalSalesPotential, missedOpportunities, trendingProduct } = kpis;

  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="flex flex-col gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red">{t("demand_radar_badge")}</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{t("adminTitle")}</h1>
        <p className="text-white/40 text-xs max-w-2xl">
          {t("subtitle")}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{t("sales_potential_title")}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">${totalSalesPotential.toLocaleString('es-CL')}</h3>
          </div>
          <p className="text-xs text-white/40 mt-2">{t("sales_potential_desc")}</p>
        </div>

        <div className="bg-[#0E121B] border border-red/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-red/10 rounded-full blur-2xl group-hover:bg-red/20 transition-all duration-500"></div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-red">{t("missed_opportunities_title")}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">${missedOpportunities.toLocaleString('es-CL')}</h3>
          </div>
          <p className="text-xs text-red/60 mt-2">{t("missed_opportunities_desc")}</p>
        </div>

        <div className="bg-[#0E121B] border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex items-center justify-between group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-400 flex items-center gap-1.5">
              <IconFlame className="w-4 h-4 text-amber-400" />
              <span>{t("trending_badge")}</span>
            </p>
            {trendingProduct ? (
              <div>
                <h3 className="text-base font-black text-white truncate max-w-[150px]">{trendingProduct.name}</h3>
                <p className="text-xs text-amber-400/80 mt-1 font-medium">{t("users_want_it", { count: trendingProduct.wishlistCount })}</p>
              </div>
            ) : (
              <h3 className="text-sm font-bold text-white/40">{t("no_data")}</h3>
            )}
          </div>
          {trendingProduct?.imageUrl && (
            <img src={trendingProduct.imageUrl} alt={trendingProduct.name} className="w-16 h-24 object-cover rounded-xl shadow-md border border-white/10 relative z-10" />
          )}
        </div>
      </div>

      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between bg-[#090C14] gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <IconHeart className="w-5 h-5 text-red" />
            {t("ranking_title")}
          </h2>
          
          <SegmentedControl
            fullWidth={false}
            size="sm"
            value={filter}
            onChange={(val) => setFilter(val as 'ALL' | 'INSTOCK' | 'OUTOFSTOCK')}
            options={[
              { value: 'ALL', label: t("filter_all"), variant: 'default' },
              { value: 'INSTOCK', label: t("filter_in_stock"), variant: 'success' },
              { value: 'OUTOFSTOCK', label: t("filter_out_of_stock"), variant: 'warning' },
            ]}
          />
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase font-black tracking-wider text-white/50">
              <tr>
                <th className="px-6 py-4 font-bold">{t("col_product")}</th>
                <th className="px-6 py-4 font-bold">{t("col_category")}</th>
                <th className="px-6 py-4 font-bold text-center">{t("col_status")}</th>
                <th className="px-6 py-4 font-bold text-right">{t("col_ref_price")}</th>
                <th className="px-6 py-4 font-bold text-center">{t("col_times_saved")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    {t("loading_ranking")}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40 text-xs">
                    {t("no_products_found")}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-[#080B12] rounded-lg flex-shrink-0 overflow-hidden border border-white/10 relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-bold">{t("no_img")}</div>
                          )}
                          {index < 3 && filter === 'ALL' && (
                            <div className="absolute top-0 right-0 bg-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl">
                              #{index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white max-w-[200px] truncate">{product.name}</div>
                          {product.cardDetail?.expansion && (
                            <div className="text-xs text-white/40 mt-0.5">{product.cardDetail.expansion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/50 text-xs font-medium">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                          {t("in_stock_count", { count: product.stockCount })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red/10 text-red border border-red/30 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                          {t("out_of_stock_badge")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {product.inStock ? (
                        <div>
                          <div className="font-bold text-white">${(product.storePrice || 0).toLocaleString('es-CL')}</div>
                          <div className="text-[10px] text-white/40">{t("your_price_label")}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-white/60">${(product.marketPrice || 0).toLocaleString('es-CL')}</div>
                          <div className="text-[10px] text-white/40">{t("market_price_label")}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 bg-red/10 text-red border border-red/30 px-3 py-1.5 rounded-full font-black text-xs">
                        <IconHeart className="w-3.5 h-3.5 fill-current" />
                        {product.wishlistCount}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
