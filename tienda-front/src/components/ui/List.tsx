import React, { ReactNode } from "react";
import { useTranslations } from "next-intl";

export interface Column<T> {
  key: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T) => ReactNode;
}

export interface ListProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: ReactNode;
  keyExtractor: (item: T) => string;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  loadingItemsCount?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function List<T>({
  data,
  columns,
  loading,
  emptyMessage,
  keyExtractor,
  wrapperProps,
  loadingItemsCount = 5,
  page,
  totalPages,
  onPageChange,
}: ListProps<T>) {
  const tc = useTranslations("common");

  return (
    <div
      {...wrapperProps}
      className={`bg-[#0E121B] rounded-2xl border border-white/10 shadow-2xl overflow-hidden ${wrapperProps?.className || ""}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#090C14] border-b border-white/10 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 font-bold text-white/50 text-[11px] uppercase tracking-wider ${col.headerClassName || ""
                    }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: loadingItemsCount }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length} className="py-6 px-6">
                    <div className="h-10 bg-white/5 rounded-xl w-full"></div>
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-white/40 text-sm font-medium"
                >
                  {emptyMessage || tc("noResults")}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-6 ${col.cellClassName || ""}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages && totalPages > 1 && page && onPageChange && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/10 bg-[#090C14]">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 bg-[#0E121B] text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
          >
            {tc("previous")}
          </button>
          <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] bg-[#0E121B] px-4 py-2 rounded-lg border border-white/10 shadow-sm">
            {tc("page", { current: page, total: totalPages })}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 bg-[#0E121B] text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
          >
            {tc("next")}
          </button>
        </div>
      )}
    </div>
  );
}
