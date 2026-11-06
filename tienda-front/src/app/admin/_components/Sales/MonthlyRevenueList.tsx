import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IconTrendingUp, IconDownload } from '@/components/ui/Icons';

export default function MonthlyRevenueList({ revenues = [] }: { revenues: any[] }) {
  const t = useTranslations('sales');
  const chartRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!chartRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#1a1d24", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `ingresos-mensuales-${new Date().getFullYear()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error al descargar la imagen", e);
      alert(t("err_generate_image"));
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#080B12] border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold mb-1 text-xs">{label}</p>
          <p className="text-emerald-400 font-black text-base">
            ${payload[0].value.toLocaleString("es-CL")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={chartRef} className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full group relative min-h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <IconTrendingUp className="w-4 h-4 text-emerald-400" />
          {t("monthly_revenue_title", { year: new Date().getFullYear() })}
        </h3>
        <button onClick={downloadImage} className="text-white/40 hover:text-white p-1.5 bg-[#080B12] border border-white/10 rounded-lg transition-colors" title={t("download_png_tooltip")}>
          <IconDownload className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        {revenues.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-5 text-sm">{t("no_data")}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenues} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="month" stroke="#6C6F93" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6C6F93" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3C50E0" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#1a1d24', stroke: '#3C50E0', strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: '#3C50E0', stroke: '#fff', strokeWidth: 2 }} 
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
