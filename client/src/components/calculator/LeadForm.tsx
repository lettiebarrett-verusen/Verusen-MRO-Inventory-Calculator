import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInputs } from "@/lib/calculator-logic";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock } from "lucide-react";

const JOB_FUNCTIONS = [
  { value: "Procurement", label: "Procurement" },
  { value: "Innovation", label: "Innovation" },
  { value: "IT / IS", label: "IT / IS" },
  { value: "Finance", label: "Finance" },
  { value: "Sourcing", label: "Sourcing" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Supply Chain", label: "Supply Chain" },
  { value: "Operations", label: "Operations" },
  { value: "Other", label: "Other" },
];

interface LeadFormProps {
  onComplete: (data: LeadInputs) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  compact?: boolean;
}

export function LeadForm({ onComplete, onBack, isSubmitting = false, compact = false }: LeadFormProps) {
  const form = useForm<LeadInputs>({
    resolver: zodResolver(leadSchema),
  });

  if (compact) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="First name" className="bg-gray-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Last name" className="bg-gray-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="email" placeholder="Business email" className="bg-gray-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Company" className="bg-gray-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobFunction"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <select 
                    {...field}
                    className="flex h-9 w-full items-center rounded-md border border-input bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select your function</option>
                    {JOB_FUNCTIONS.map((fn) => (
                      <option key={fn.value} value={fn.value}>{fn.label}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-[#003252] hover:bg-[#003252]/90 h-11" disabled={isSubmitting} data-testid="button-reveal-savings">
            {isSubmitting ? "Submitting..." : "Unlock My Full Report"} {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> We respect your privacy. No spam.
          </p>
        </form>
      </Form>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#003252] mb-2">Your Results Are Ready</h2>
        <p className="text-muted-foreground">
          Enter your details to unlock your customized inventory optimization report.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jane" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="jane@company.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Acme Industries" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobFunction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Function</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select your function</option>
                    {JOB_FUNCTIONS.map((fn) => (
                      <option key={fn.value} value={fn.value}>{fn.label}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full mt-6 h-12 text-lg bg-[#003252] hover:bg-[#003252]/90" disabled={isSubmitting} data-testid="button-reveal-savings">
            {isSubmitting ? "Submitting..." : "Reveal My Savings"} {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mt-4">
            <Lock className="w-3 h-3" /> We respect your privacy. No spam.
          </p>

          <div className="text-center mt-2">
            <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:underline">
              Back to Calculator
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
