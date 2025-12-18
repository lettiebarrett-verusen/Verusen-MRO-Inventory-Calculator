import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const scrollToCalculator = () => {
    document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden bg-primary text-primary-foreground min-h-[80vh] flex items-center">
      {/* Background Graphic */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 50%, hsl(183, 100%, 25%), transparent 60%), radial-gradient(circle at 30% 80%, hsl(222, 47%, 40%), transparent 60%)`
        }}
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 mb-6 text-sm font-medium tracking-wide bg-white/10 rounded-full border border-white/20 backdrop-blur-sm text-accent">
            Inventory Optimization Calculator
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
            Unlock Hidden <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-cyan-400">Inventory Value</span> <br/>
            in Minutes
          </h1>
          <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-lg leading-relaxed">
            Estimate how much working capital you could recover from excess, duplicate, and non-moving inventory without deep data or system access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={scrollToCalculator}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-14 px-8 rounded-full shadow-lg shadow-cyan-900/20"
            >
              Calculate Opportunity <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Abstract Data Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" />
             <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="h-2 bg-white/10 rounded w-1/3"></div>
                  <div className="h-8 bg-white/20 rounded w-3/4"></div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-24 rounded-lg bg-gradient-to-b from-white/10 to-transparent border border-white/5 p-4 flex flex-col justify-end">
                        <div className="h-2 bg-accent/50 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-white/30 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
