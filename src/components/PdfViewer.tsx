import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PdfFile } from "./Header";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [animationDirection, setAnimationDirection] = useState<"left" | "right" | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setLoading(true);
    setAnimationDirection(offset > 0 ? "right" : "left");
    
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
      setAnimationDirection(page > pageNumber ? "right" : "left");
      setPageNumber(page);
    }
  };

  // Function to generate pagination numbers with ellipsis
  const getPageNumbers = () => {
    if (!numPages) return [];
    
    const totalPages = numPages;
    const current = pageNumber;
    const items: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always include first page
      items.push(1);
      
      // Add ellipsis if current page is more than 3
      if (current > 3) {
        items.push('ellipsis-start');
      }
      
      // Add pages around current page
      const startPage = Math.max(2, current - 1);
      const endPage = Math.min(totalPages - 1, current + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      // Add ellipsis if current page is less than totalPages - 2
      if (current < totalPages - 2) {
        items.push('ellipsis-end');
      }
      
      // Always include last page
      items.push(totalPages);
    }
    
    return items;
  };

  // Reset animation direction after animation completes
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection(null);
      }, 500); // match this to the animation duration
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  // Initial scale with 190% zoom
  const [initialScale, setInitialScale] = useState<number>(1.9);
  
  useEffect(() => {
    // Apply the 190% zoom level when document loads
    if (numPages && !loading) {
      setScale(initialScale);
    }
  }, [numPages, initialScale, loading]);

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 4));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(initialScale); // Reset to 190%

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  // Mouse movement handler for showing controls
  const handleMouseMove = () => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    // Show controls
    setIsHovering(true);
    
    // Set timeout to hide controls after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsHovering(false);
    }, 3000);
    
    setHideTimeout(timeout);
  };
  
  // Track file changes to show loading animation
  useEffect(() => {
    if (pdfFile) {
      setFileLoading(true);
      // Reset states when switching files
      setNumPages(null);
      setPageNumber(1);
      setLoading(true);
      
      // Simulate a minimal loading time to ensure animation is visible
      const timer = setTimeout(() => {
        setFileLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [pdfFile?.path]);

  return (
    <div 
      className="pdf-container relative h-screen w-full"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {pdfFile ? (
        <div className="flex flex-col items-center h-full">
          {/* File loading overlay */}
          {fileLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-medium">Loading document...</p>
              </div>
            </div>
          )}
          
          {/* Side navigation buttons - only visible on hover */}
          {numPages && numPages > 1 && (
            <>
              <button
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/95 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed z-10 ${
                  isHovering ? "opacity-80" : "opacity-0"
                }`}
                onClick={previousPage}
                disabled={pageNumber <= 1 || loading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              <button
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/95 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed z-10 ${
                  isHovering ? "opacity-80" : "opacity-0"
                }`}
                onClick={nextPage}
                disabled={pageNumber >= (numPages || 1) || loading}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}

          <div className="pdf-viewer relative h-full w-full overflow-auto">
            <ScrollArea className="h-full w-full">
              {!fileLoading && (
                <Document
                  file={pdfFile.path}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center items-center h-screen">
                      <div className="loading-skeleton bg-gray-100 rounded-md w-[600px] h-[800px] relative overflow-hidden">
                        <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      </div>
                    </div>
                  }
                  error={
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4 max-w-md mx-auto">
                      <p className="text-red-600 font-medium mb-2">Unable to load document</p>
                      <p className="text-red-500 text-sm">The file may be corrupted or in an unsupported format.</p>
                    </div>
                  }
                  className="flex justify-center items-center min-h-screen"
                >
                  <div 
                    className={`transition-all duration-300 ease-in-out h-full flex items-center justify-center ${
                      loading ? "opacity-0" : "opacity-100"
                    } ${
                      animationDirection === "left" 
                        ? "animate-slide-left" 
                        : animationDirection === "right" 
                        ? "animate-slide-right" 
                        : ""
                    }`}
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<Skeleton className="w-[612px] h-[792px]" />}
                      onRenderSuccess={() => setLoading(false)}
                      className="shadow-xl rounded-sm mx-auto bg-white"
                      scale={scale}
                    />
                  </div>
                </Document>
              )}
            </ScrollArea>
          </div>
          
          {/* Controls container - only visible on hover */}
          <div 
  className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 flex flex-row items-center gap-2 max-w-5xl bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md transition-all duration-300 ${
    isHovering ? "opacity-90 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"
  }`}
>

            {/* Page Numbers */}
            {numPages && numPages > 1 && (
              <Pagination className="mb-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={previousPage} 
                      className={`transition-all ${pageNumber <= 1 || loading ? "pointer-events-none opacity-50" : "hover:scale-105"}`}
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
                          className={page === pageNumber ? "font-bold" : "hover:scale-110 transition-transform"}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage} 
                      className={`transition-all ${pageNumber >= (numPages || 1) || loading ? "pointer-events-none opacity-50" : "hover:scale-105"}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-3 mt-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="rounded-full hover:bg-muted/50 transition-all hover:scale-105"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetZoom}
                className="rounded-full hover:bg-muted/50 transition-all hover:scale-105 text-xs font-medium"
                title="Return to default view"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {Math.round(scale * 100)}%
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={zoomIn}
                disabled={scale >= 2}
                className="rounded-full hover:bg-muted/50 transition-all hover:scale-105"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Page Status */}
            
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-b from-white/50 to-muted/30 rounded-lg border border-muted backdrop-blur-sm shadow-lg w-full max-w-3xl mx-auto">
          <div className="bg-white/60 p-8 rounded-lg shadow-inner max-w-md mx-auto">
            <p className="text-primary font-semibold text-lg">No publication selected</p>
            <p className="text-sm text-muted-foreground mt-2">Please select a publication from the dropdown above</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;