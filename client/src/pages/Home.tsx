import { Navbar } from "@/components/landing/Navbar";
import { Calculator } from "@/components/calculator/Calculator";
import { CheckCircle2, TrendingUp, Network } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      
      <Calculator />

      {/* How It Works / Value Prop Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Why It Matters</h2>
            <p className="text-lg text-muted-foreground">
              Most organizations don't realize how much inventory value is tied up across sites, SKUs, and material categories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Active Material Optimization",
                desc: "Identify active items that are overstocked or poorly forecasted."
              },
              {
                icon: Network,
                title: "Network Transfers",
                desc: "Balance inventory across sites instead of buying new stock."
              },
              {
                icon: CheckCircle2,
                title: "VMI & Consignment",
                desc: "Shift ownership of low-criticality items to suppliers."
              }
            ].map((item, i) => (
              <div key={i} className="bg-background p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
