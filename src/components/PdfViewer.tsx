
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PdfFile } from "./Header";

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfFile: PdfFile | null;
}

const PdfViewer = ({ pdfFile }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setLoading(true);
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <div className="pdf-container">
      {pdfFile ? (
        <div className="flex flex-col items-center">
          <div className="pdf-viewer">
            <Document
              file={pdfFile.path}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="flex justify-center p-10"><Skeleton className="w-[612px] h-[792px]" /></div>}
              error={<div className="text-red-500 p-4">Failed to load PDF. Please try again later.</div>}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<Skeleton className="w-[612px] h-[792px]" />}
                onRenderSuccess={() => setLoading(false)}
                className="shadow-lg mx-auto"
              />
            </Document>
          </div>
          
          <div className="mt-4 flex items-center gap-4 justify-center">
            <Button
              variant="outline"
              onClick={previousPage}
              disabled={pageNumber <= 1 || loading}
              className="gap-1"
            >
              <ChevronUp className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {pageNumber} of {numPages || "--"}
            </span>
            <Button
              variant="outline"
              onClick={nextPage}
              disabled={pageNumber >= (numPages || 1) || loading}
              className="gap-1"
            >
              Next
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No publication selected</p>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
