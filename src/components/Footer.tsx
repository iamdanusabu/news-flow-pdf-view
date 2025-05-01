
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} News Portal. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
