import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
      alert("Hubo un error al generar la imagen");
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1115] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-blue font-black text-lg">
            ${payload[0].value.toLocaleString("es-CL")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={chartRef} className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-1 flex flex-col h-full group relative min-h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <span className="text-xl">📈</span> INGRESOS POR MES ({new Date().getFullYear()})
        </h3>
        <button onClick={downloadImage} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar como Imagen (PNG)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        {revenues.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-5 text-sm">No hay datos</div>
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
