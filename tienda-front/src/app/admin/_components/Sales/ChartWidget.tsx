import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartWidgetProps {
  id: string;
  title: string;
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  defaultType?: "line" | "bar" | "pie";
  colors?: string[];
}

const COLORS = ["#3C50E0", "#22AD5C", "#FBBF24", "#F23030", "#02AAA4", "#9C27B0", "#FF9800", "#E91E63"];

export default function ChartWidget({
  id,
  title,
  data,
  dataKeyX,
  dataKeyY,
  defaultType = "bar",
  colors = COLORS,
}: ChartWidgetProps) {
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">(defaultType);

  const renderChart = () => {
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-4">No hay datos suficientes</div>;
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey={dataKeyX} stroke="#6C6F93" fontSize={12} />
              <YAxis stroke="#6C6F93" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1d24", borderColor: "#ffffff20", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line type="monotone" dataKey={dataKeyY} stroke={colors[0]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKeyY}
                nameKey={dataKeyX}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1d24", borderColor: "#ffffff20", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey={dataKeyX} stroke="#6C6F93" fontSize={12} />
              <YAxis stroke="#6C6F93" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1d24", borderColor: "#ffffff20", color: "#fff" }}
                cursor={{ fill: "#ffffff05" }}
              />
              <Legend />
              <Bar dataKey={dataKeyY} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const exportWidgetToPDF = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const element = document.getElementById(id);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0f1115" });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reporte-${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div id={id} className="bg-[#1a1d24] border border-white/5 rounded-2xl shadow-1 p-6 flex flex-col h-96">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={exportWidgetToPDF}
            className="p-1.5 rounded-md transition-colors text-gray-4 hover:text-white bg-[#0f1115] border border-white/5"
            title="Descargar este gráfico a PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <div className="flex gap-2 bg-[#0f1115] p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setChartType("bar")}
            className={`p-1.5 rounded-md transition-colors ${chartType === "bar" ? "bg-blue text-white" : "text-gray-4 hover:text-white"}`}
            title="Barras"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`p-1.5 rounded-md transition-colors ${chartType === "line" ? "bg-blue text-white" : "text-gray-4 hover:text-white"}`}
            title="Líneas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`p-1.5 rounded-md transition-colors ${chartType === "pie" ? "bg-blue text-white" : "text-gray-4 hover:text-white"}`}
            title="Torta"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          </button>
        </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        {renderChart()}
      </div>
    </div>
  );
}
