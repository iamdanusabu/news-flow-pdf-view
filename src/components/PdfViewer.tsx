
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PdfFile } from "./Header";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfFile: PdfFile | null;
}

const PdfViewer = ({ pdfFile }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);

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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      setLoading(true);
      setPageNumber(page);
    }
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  // Generate page numbers to display in pagination
  const getPageNumbers = () => {
    if (!numPages) return [];
    
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (numPages <= maxVisiblePages) {
      // Show all pages if there are less than maxVisiblePages
      for (let i = 1; i <= numPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      const startPage = Math.max(2, pageNumber - 1);
      const endPage = Math.min(numPages - 1, pageNumber + 1);
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add current range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < numPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always show last page
      pageNumbers.push(numPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="pdf-container relative">
      {pdfFile ? (
        <div className="flex flex-col items-center">
          {/* Side navigation buttons */}
          {numPages && numPages > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={previousPage}
                disabled={pageNumber <= 1 || loading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </button>

              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={nextPage}
                disabled={pageNumber >= (numPages || 1) || loading}
                aria-label="Next page"
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </button>
            </>
          )}

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
                scale={scale}
              />
            </Document>
          </div>
          
          {/* Enhanced Page Controls */}
          <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-2xl">
            {/* Page Numbers */}
            {numPages && numPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={previousPage} 
                      className={pageNumber <= 1 || loading ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          isActive={page === pageNumber}
                          onClick={() => goToPage(page as number)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage} 
                      className={pageNumber >= (numPages || 1) || loading ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={zoomOut}
                disabled={scale <= 0.5}
              >
                Zoom Out
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetZoom}
              >
                Reset ({Math.round(scale * 100)}%)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={zoomIn}
                disabled={scale >= 2}
              >
                Zoom In
              </Button>
            </div>

            {/* Page Status */}
            <div className="text-sm text-muted-foreground mt-2">
              {loading ? (
                <span>Loading page {pageNumber}...</span>
              ) : (
                <span>
                  Page {pageNumber} of {numPages || "--"}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-muted w-full max-w-3xl mx-auto">
          <p className="text-muted-foreground">No publication selected</p>
          <p className="text-sm text-muted-foreground mt-2">Please select a publication from the dropdown above</p>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
