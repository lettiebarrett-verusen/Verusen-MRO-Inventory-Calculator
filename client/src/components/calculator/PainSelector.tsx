import { type PainPoint } from "@/lib/calculator-logic";
import { Package, DollarSign, AlertTriangle, Check } from "lucide-react";

interface PainSelectorProps {
  selected: Set<PainPoint>;
  onToggle: (pain: PainPoint) => void;
}

const painOptions: { id: PainPoint; icon: typeof Package; title: string; description: string }[] = [
  {
    id: "inventory",
    icon: Package,
    title: "Inventory Bloat",
    description: "Too much cash tied up in parts. Duplicate SKUs across plants. No visibility into what you actually have.",
  },
  {
    id: "spend",
    icon: DollarSign,
    title: "Spend Leakage",
    description: "Maverick buying. Supplier consolidation opportunities. Too many catalogs, not enough contract compliance.",
  },
  {
    id: "downtime",
    icon: AlertTriangle,
    title: "Downtime Risk",
    description: "Critical parts aren't there when needed. Stockouts causing production delays and emergency purchases.",
  },
];

export function PainSelector({ selected, onToggle }: PainSelectorProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#003252] mb-1" data-testid="text-pain-title">
        What's your biggest MRO pain right now?
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Select one or more areas. We'll tailor your results to lead with what matters most to you.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {painOptions.map((option) => {
          const isSelected = selected.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              data-testid={`card-pain-${option.id}`}
              onClick={() => onToggle(option.id)}
              className={`relative text-left p-6 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? "border-[#0075c9] bg-[#0075c9]/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-[#0075c9]/40 hover:bg-[#0075c9]/5"
              }`}
            >
              <div
                className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "bg-[#0075c9] border-[#0075c9]" : "border-gray-300 bg-white"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                isSelected ? "bg-[#0075c9]/10" : "bg-gray-100"
              }`}>
                <option.icon className={`w-5 h-5 ${isSelected ? "text-[#0075c9]" : "text-gray-500"}`} />
              </div>

              <h3 className="font-semibold text-[#003252] mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
