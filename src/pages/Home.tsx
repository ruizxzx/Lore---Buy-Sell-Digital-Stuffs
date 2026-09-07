import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { ArrowRight, Zap, Shield, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-200">
      {/* Hero Section */}
      <section className="relative py-32 sm:py-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            System Workspace • v4.2
          </div>
          <h1 className="text-6xl sm:text-8xl font-display font-black tracking-tighter mb-8 text-white leading-tight">
            Sell What <br/> You Know.
          </h1>
          <p className="text-xl font-body max-w-2xl mb-12 text-neutral-400 leading-relaxed">
            The ultimate bento grid workspace for digital products, courses, templates, and more. Deploy your cognitive assets effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/onboarding">
              <Button size="lg" className="w-full sm:w-auto text-lg rounded-2xl">Start Selling <ArrowRight className="ml-2 w-5 h-5" /></Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg rounded-2xl">Explore Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Instant Setup"
              description="Upload your product, set a price, and start selling in seconds. We handle the rest."
              accentColor="bg-indigo-600 shadow-indigo-500/20"
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-emerald-950" />}
              title="Secure Delivery"
              description="Your files are protected. Only paying customers get access to your secure downloads."
              accentColor="bg-emerald-400 shadow-emerald-400/20"
            />
            <FeatureCard 
              icon={<ShoppingBag className="w-8 h-8 text-white" />}
              title="Zero Hassle"
              description="We handle Stripe payments, automated emails, and customer access automatically."
              accentColor="bg-neutral-800 shadow-neutral-900/50"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, accentColor }: { icon: React.ReactNode, title: string, description: string, accentColor: string }) {
  return (
    <Card className="h-full flex flex-col group overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
      <CardContent className="flex-1 flex flex-col p-10 mt-0 bg-transparent z-10 relative">
        <div className={`w-16 h-16 rounded-3xl mb-8 flex items-center justify-center shadow-lg ${accentColor}`}>
          {icon}
        </div>
        <h3 className="text-3xl font-bold tracking-tighter mb-4 text-white">{title}</h3>
        <p className="font-body text-neutral-400 leading-relaxed flex-1">{description}</p>
      </CardContent>
    </Card>
  );
}
