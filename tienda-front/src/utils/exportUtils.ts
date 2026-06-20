import Papa from "papaparse";

export const exportToPDF = async (elementId: string, filename: string = "reporte.pdf") => {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
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
  pdf.save(filename);
};

export const downloadCSV = async (url: string, filename: string) => {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error();
    const rawData = await res.json();
    
    const csv = Papa.unparse(rawData);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); // \uFEFF para soportar tildes en Excel
    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.setAttribute("href", downloadUrl);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("Error al descargar CSV", e);
    throw new Error("Error al descargar el reporte CSV");
  }
};
