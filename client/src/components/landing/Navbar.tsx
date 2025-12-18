export function Navbar() {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/verusen-logo.png" 
            alt="Verusen Logo" 
            className="h-10 md:h-12 object-contain"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Inventory Optimization Calculator
        </div>
      </div>
    </nav>
  );
}
