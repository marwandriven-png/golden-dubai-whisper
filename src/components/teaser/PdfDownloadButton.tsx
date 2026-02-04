import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

const PdfDownloadButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    const element = document.getElementById("teaser-content");
    if (!element) {
      setIsGenerating(false);
      return;
    }

    const opt = {
      margin: 0,
      filename: "Confidential-Hotel-Investment-Deira-Dubai.pdf",
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: { 
        unit: "in" as const, 
        format: "a4" as const, 
        orientation: "portrait" as const
      },
      pagebreak: { mode: "avoid-all" as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 font-semibold shadow-lg hover:bg-accent/90 transition-all print:hidden"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </>
      )}
    </button>
  );
};

export default PdfDownloadButton;
