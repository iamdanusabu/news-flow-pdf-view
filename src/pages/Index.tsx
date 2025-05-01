
import { useState, useEffect } from "react";
import Header, { PdfFile } from "../components/Header";
import PdfViewer from "../components/PdfViewer";
import Footer from "../components/Footer";

const Index = () => {
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [availablePdfs, setAvailablePdfs] = useState<PdfFile[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this list from an API or backend
    // For now, we'll use a hardcoded list that references files in the public/pdfs folder
    const pdfs: PdfFile[] = [
      {
        id: "daily-news",
        name: "Daily News Report",
        path: "/pdfs/sample1.pdf"
      },
      {
        id: "finance-weekly",
        name: "Finance Weekly",
        path: "/pdfs/sample2.pdf"
      },
      {
        id: "tech-review",
        name: "Technology Review",
        path: "/pdfs/sample3.pdf"
      }
    ];
    
    setAvailablePdfs(pdfs);
    
    // Log a message to let users know they need to add PDF files
    console.log("Please add PDF files to the public/pdfs folder with names: sample1.pdf, sample2.pdf, sample3.pdf");
  }, []);

  const handlePdfSelect = (pdf: PdfFile) => {
    setSelectedPdf(pdf);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPdfSelect={handlePdfSelect} availablePdfs={availablePdfs} />
      <main className="flex-1">
        <PdfViewer pdfFile={selectedPdf} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
