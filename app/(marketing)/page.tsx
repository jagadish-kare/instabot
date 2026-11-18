import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Star,
  Send,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">InstaBot</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">How it Works</Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-5 shadow-lg shadow-purple-500/25">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                AI-Powered Automation
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Automate Your
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Instagram DMs
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
                Turn every comment into a conversation. Automatically send personalized DMs when users comment keywords on your posts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-8 py-6 text-lg shadow-xl shadow-purple-500/30">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="rounded-lg px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">14-day free trial</span>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="relative flex justify-center">
              {/* Phone Mockup */}
              <div className="relative w-[300px] h-[600px] bg-gray-800 rounded-[3rem] p-2 shadow-2xl shadow-purple-500/20 border border-white/10">
                <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden">
                  {/* Instagram Header */}
                  <div className="bg-gray-900 px-4 py-3 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <div>
                      <p className="font-semibold text-sm text-white">@yourbrand</p>
                      <p className="text-xs text-gray-500">Active now</p>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 bg-gray-900/50 h-[calc(100%-110px)]">
                    {/* User Comment */}
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] border border-white/5">
                        <p className="text-sm text-gray-200">Hey! Can I get the LINK? 🔗</p>
                      </div>
                    </div>
                    
                    {/* Bot Response */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-white">Thanks for your interest! 🎉</p>
                        <p className="text-sm text-white/90 mt-1">Here&apos;s your exclusive link:</p>
                        <div className="mt-2 bg-white/20 rounded-lg px-3 py-2">
                          <p className="text-xs text-white">🔗 yourbrand.com/special</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Typing indicator */}
                    <div className="flex justify-end">
                      <div className="bg-gray-800 rounded-full px-4 py-2 border border-white/10">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input */}
                  <div className="absolute bottom-4 left-4 right-4 bg-gray-800 rounded-full border border-white/10 flex items-center px-4 py-2">
                    <input placeholder="Message..." className="flex-1 text-sm outline-none bg-transparent text-gray-400" disabled />
                    <Send className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-16 -left-8 bg-gray-800/90 backdrop-blur rounded-xl border border-white/10 shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">DM Sent!</p>
                  <p className="text-xs text-gray-500">2 seconds ago</p>
                </div>
              </div>

              <div className="absolute bottom-24 -right-8 bg-gray-800/90 backdrop-blur rounded-xl border border-white/10 shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">+127 Followers</p>
                  <p className="text-xs text-gray-500">This week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to automate your Instagram growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<MessageCircle className="w-6 h-6" />}
              title="Keyword-Triggered DMs"
              description="Automatically send personalized DMs when users comment specific keywords"
              gradient="from-purple-500 to-purple-600"
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Follow Gating"
              description="Require users to follow before receiving content - grow your audience!"
              gradient="from-pink-500 to-pink-600"
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Instant Delivery"
              description="DMs sent within seconds of a qualifying comment"
              gradient="from-orange-500 to-orange-600"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Real-time Analytics"
              description="Track comments, DMs sent, and conversion rates"
              gradient="from-blue-500 to-blue-600"
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="100% Compliant"
              description="Uses official Instagram APIs - your account stays safe"
              gradient="from-green-500 to-green-600"
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Smart Templates"
              description="Pre-built templates or create custom responses"
              gradient="from-violet-500 to-violet-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Get started in 3 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Connect Account"
              description="Link your Instagram Business or Creator account securely"
            />
            <StepCard 
              number="2"
              title="Create Campaign"
              description="Select posts, set keywords, and customize your DM"
            />
            <StepCard 
              number="3"
              title="Watch It Work"
              description="DMs are sent automatically 24/7 to engaged users"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-400">Start free, upgrade when you need more</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard 
              name="Starter"
              price="Free"
              period=""
              features={[
                "1 Instagram Account",
                "3 Active Campaigns",
                "500 DMs/month",
                "Basic Analytics",
              ]}
              cta="Get Started"
              href="/register"
            />
            <PricingCard 
              name="Pro"
              price="$29"
              period="/mo"
              features={[
                "3 Instagram Accounts",
                "Unlimited Campaigns",
                "10,000 DMs/month",
                "Advanced Analytics",
                "Follow Gating",
                "Priority Support",
              ]}
              cta="Start Free Trial"
              href="/register"
              featured
            />
            <PricingCard 
              name="Business"
              price="$99"
              period="/mo"
              features={[
                "10 Instagram Accounts",
                "Unlimited Campaigns",
                "Unlimited DMs",
                "Custom Analytics",
                "API Access",
                "Dedicated Support",
              ]}
              cta="Contact Sales"
              href="/register"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Creators</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="InstaBot helped me grow my followers by 5,000 in just one month!"
              author="Sarah M."
              role="Content Creator"
            />
            <TestimonialCard 
              quote="Finally, a tool that works and doesn't get my account flagged."
              author="Mike T."
              role="E-commerce Owner"
            />
            <TestimonialCard 
              quote="The follow gating feature is genius. Highly recommend!"
              author="Jessica L."
              role="Influencer"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to automate your Instagram?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of creators scaling with InstaBot
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-10 py-6 text-lg shadow-xl shadow-purple-500/30">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">InstaBot</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-gray-600">© 2024 InstaBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-gray-800/70 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-purple-500/30">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  period,
  features, 
  cta, 
  href, 
  featured = false 
}: { 
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-8 ${
      featured 
        ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50" 
        : "bg-gray-800/50 border border-white/10"
    }`}>
      {featured && (
        <div className="inline-block px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 text-xs font-medium mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-gray-500">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href={href}>
        <Button className={`w-full rounded-lg py-5 ${
          featured 
            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
            : "bg-white/10 hover:bg-white/20 text-white"
        }`}>
          {cta}
        </Button>
      </Link>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { 
  quote: string; 
  author: string; 
  role: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/10">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-300 mb-4 text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  );
}
