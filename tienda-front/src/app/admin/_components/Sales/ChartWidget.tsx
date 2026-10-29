import React, { useState, useEffect } from "react";
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
import {
  IconDownload,
  IconBarChart,
  IconPieChart,
} from "@/components/ui/Icons";

interface ChartWidgetProps {
  id: string;
  title: string;
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  defaultType?: "line" | "bar" | "pie";
  colors?: string[];
}

const COLORS = ["#E10E0E", "#22AD5C", "#FBBF24", "#02AAA4", "#9C27B0", "#FF9800", "#E91E63", "#3C50E0"];

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderChart = () => {
    if (!isMounted) {
      return <div className="w-full h-[260px]" />;
    }
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-full text-white/40 text-sm">No hay datos suficientes</div>;
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={220}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey={dataKeyX} stroke="#6C6F93" fontSize={12} />
              <YAxis stroke="#6C6F93" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0E121B", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line type="monotone" dataKey={dataKeyY} stroke={colors[0]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={220}>
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
                contentStyle={{ backgroundColor: "#0E121B", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={220}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey={dataKeyX} stroke="#6C6F93" fontSize={12} />
              <YAxis stroke="#6C6F93" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0E121B", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff" }}
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

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0E121B" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reporte-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div id={id} className="bg-[#0E121B] border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col h-96">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={exportWidgetToPDF}
            className="p-1.5 rounded-lg transition-colors text-white/50 hover:text-white bg-white/5 border border-white/10"
            title="Descargar este gráfico a PDF"
          >
            <IconDownload className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5 bg-[#080B12] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === "bar"
                  ? "bg-gradient-to-r from-red-dark to-red text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
              title="Barras"
            >
              <IconBarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === "line"
                  ? "bg-gradient-to-r from-red-dark to-red text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
              title="Líneas"
            >
              <IconBarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === "pie"
                  ? "bg-gradient-to-r from-red-dark to-red text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
              title="Torta"
            >
              <IconPieChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[260px] min-w-0 relative">
        {renderChart()}
      </div>
    </div>
  );
}
