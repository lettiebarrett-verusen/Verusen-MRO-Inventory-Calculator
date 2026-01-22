import { Navbar } from "@/components/landing/Navbar";
import { Calculator } from "@/components/calculator/Calculator";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      
      <Calculator />

      <footer className="bg-primary text-primary-foreground py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-blue-200">
            © 2025 Inventory AI Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
