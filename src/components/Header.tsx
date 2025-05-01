import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";

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
    const selectedFile = availablePdfs.find((pdf) => pdf.id === value);
    if (selectedFile) {
      onPdfSelect(selectedFile);
    }
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Date + Version Selector */}
        <div className="flex flex-col items-start space-y-1">
          <span className="text-sm text-gray-600">{formattedDate}</span>
          <div className="w-[160px] sm:w-[220px]">
            <Select value={selectedPdf} onValueChange={handlePdfChange}>
              <SelectTrigger className="border border-gray-300 bg-white text-gray-800 hover:border-gray-400 focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Select edition" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {availablePdfs.map((pdf) => (
                  <SelectItem key={pdf.id} value={pdf.id}>
                    {pdf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: Logo, Name & Subtitle */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="h-7 w-7 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">News Portal</h1>
          </div>
          <p className="text-sm text-gray-500">Your trusted daily digital edition</p>
        </div>

        {/* Right Side: Social Icons */}
        <div className="flex items-center space-x-4">
          {/* Placeholder links for socials */}
          <a href="#" aria-label="Twitter">
            <Twitter className="h-5 w-5 text-gray-600 hover:text-blue-500 transition" />
          </a>
          <a href="#" aria-label="Facebook">
            <Facebook className="h-5 w-5 text-gray-600 hover:text-blue-700 transition" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <Linkedin className="h-5 w-5 text-gray-600 hover:text-blue-600 transition" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
