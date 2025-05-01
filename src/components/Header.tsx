
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FileText } from "lucide-react";

export interface PdfFile {
  id: string;
  name: string;
  path: string;
}

interface HeaderProps {
  onPdfSelect: (pdf: PdfFile) => void;
  availablePdfs: PdfFile[];
}

const Header = ({ onPdfSelect, availablePdfs }: HeaderProps) => {
  const [selectedPdf, setSelectedPdf] = useState<string>("");

  useEffect(() => {
    if (availablePdfs.length > 0 && !selectedPdf) {
      setSelectedPdf(availablePdfs[0].id);
      onPdfSelect(availablePdfs[0]);
    }
  }, [availablePdfs, selectedPdf, onPdfSelect]);

  const handlePdfChange = (value: string) => {
    setSelectedPdf(value);
    const selectedFile = availablePdfs.find(pdf => pdf.id === value);
    if (selectedFile) {
      onPdfSelect(selectedFile);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="hidden text-xl font-bold text-primary sm:inline-block">
            News Portal
          </h1>
        </div>
        
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-4">
            <div className="w-[180px] sm:w-[250px]">
              <Select value={selectedPdf} onValueChange={handlePdfChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select publication" />
                </SelectTrigger>
                <SelectContent>
                  {availablePdfs.map((pdf) => (
                    <SelectItem key={pdf.id} value={pdf.id}>
                      {pdf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
