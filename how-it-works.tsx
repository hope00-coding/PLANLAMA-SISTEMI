import { ClipboardCheck, Bot, Heart } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: ClipboardCheck,
      title: "Share Your Preferences",
      description: "Tell us about your interests, budget, and what you're looking for through our simple questionnaire.",
      color: "from-blue-500 to-violet-500",
      bgColor: "bg-blue-600"
    },
    {
      number: 2,
      icon: Bot,
      title: "AI Finds Matches",
      description: "Our intelligent algorithm analyzes your preferences and finds the perfect recommendations just for you.",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-600"
    },
    {
      number: 3,
      icon: Heart,
      title: "Discover & Enjoy",
      description: "Browse your personalized recommendations and discover exactly what you've been looking for.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get personalized recommendations in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div key={step.number} className="text-center group">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                    <IconComponent className="text-2xl text-white w-8 h-8" />
                  </div>
                  <div className={`absolute -top-2 -right-2 w-8 h-8 ${step.bgColor} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
