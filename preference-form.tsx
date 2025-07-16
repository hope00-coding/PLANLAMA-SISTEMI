import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const preferenceSchema = z.object({
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  budgetRange: z.array(z.number()).length(2),
});

type PreferenceFormData = z.infer<typeof preferenceSchema>;

const categories = [
  { id: "Technology", label: "Technology", icon: "💻" },
  { id: "Design", label: "Design", icon: "🎨" },
  { id: "Travel", label: "Travel", icon: "✈️" },
  { id: "Fashion", label: "Fashion", icon: "👗" },
  { id: "Sports", label: "Sports", icon: "⚽" },
  { id: "Food", label: "Food", icon: "🍕" },
];

export default function PreferenceForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const { toast } = useToast();

  const form = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      categories: [],
      budgetRange: [0, 1000],
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: PreferenceFormData) => {
      const response = await apiRequest("POST", "/api/preferences", {
        categories: data.categories,
        budgetMin: data.budgetRange[0].toString(),
        budgetMax: data.budgetRange[1].toString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved!",
        description: "Your preferences have been saved successfully.",
      });
      // Scroll to recommendations
      const element = document.getElementById("recommendations");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PreferenceFormData) => {
    savePreferencesMutation.mutate(data);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setProgress(Math.min(100, progress + 25));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setProgress(Math.max(0, progress - 25));
    }
  };

  const budgetRange = form.watch("budgetRange");

  return (
    <section id="preferences" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Tell Us What You Love
          </h2>
          <p className="text-xl text-slate-600">
            Answer a few quick questions to get personalized recommendations
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Step {currentStep} of 4</span>
              <span className="text-sm font-medium text-blue-600">{progress}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 1 && (
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-6">What categories interest you most?</h3>
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {categories.map((category) => (
                            <FormField
                              key={category.id}
                              control={form.control}
                              name="categories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, category.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== category.id
                                                )
                                              );
                                        }}
                                        className="sr-only peer"
                                      />
                                    </FormControl>
                                    <div className="border-2 border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 peer-checked:border-blue-600 peer-checked:bg-blue-50 transition-all w-full">
                                      <div className="text-3xl mb-3">{category.icon}</div>
                                      <p className="font-medium text-slate-700">{category.label}</p>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Budget Range</h3>
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Slider
                              min={0}
                              max={5000}
                              step={50}
                              value={field.value}
                              onValueChange={field.onChange}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-slate-600 mt-2">
                              <span>$0</span>
                              <span className="font-medium text-blue-600">
                                ${budgetRange[0]} - ${budgetRange[1]}
                              </span>
                              <span>$5000+</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Additional Preferences</h3>
                  <p className="text-slate-600 mb-6">
                    We're analyzing your preferences to find the perfect matches. This helps us understand your style and needs better.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-medium text-slate-900">Quality Priority</h4>
                      <p className="text-sm text-slate-600">Focus on high-quality, premium options</p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-medium text-slate-900">Value Priority</h4>
                      <p className="text-sm text-slate-600">Focus on best value and deals</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Ready to Discover</h3>
                  <p className="text-slate-600 mb-6">
                    Perfect! We've gathered all your preferences. Click submit to get your personalized recommendations.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Your Preferences Summary:</h4>
                    <div className="text-sm text-blue-800">
                      <p>Categories: {form.getValues("categories").join(", ")}</p>
                      <p>Budget: ${form.getValues("budgetRange")[0]} - ${form.getValues("budgetRange")[1]}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-3"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={savePreferencesMutation.isPending}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                  >
                    {savePreferencesMutation.isPending ? "Saving..." : "Get My Recommendations"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
