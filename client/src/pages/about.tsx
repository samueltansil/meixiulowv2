import { Link } from "wouter";
import logo from "@assets/whypals-logo.png";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain" />
            WhyPals
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* About Why Pals */}
          <section className="space-y-6 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary">About Why Pals</h1>
            <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
              <p>The world is full of big questions.</p>
              <p>Why are prices going up? Why do countries argue? Why do people protest? Why does the weather feel different these days?</p>
              <p>Kids notice these things. They hear bits and pieces. And naturally, they ask… why.</p>
              <p className="font-medium text-primary">That’s where Why Pals comes in.</p>
            </div>
          </section>

          {/* What Is Why Pals? */}
          <section className="space-y-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">What Is Why Pals?</h2>
            <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
              <p>Why Pals is a place where kids learn about the world by exploring real things that are happening around them.</p>
              <p>We turn everyday events into simple stories that help children understand new ideas, build world knowledge, and practise important skills like curiosity, thinking, and asking good questions.</p>
              <p>Why Pals helps kids go one step further — from what is happening to asking why.</p>
            </div>
          </section>

          {/* What We Do Here */}
          <section className="space-y-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">What We Do Here</h2>
            <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
              <p>At Why Pals, we:</p>
              <ul className="list-none space-y-2">
                <li>Explain current affairs using simple, original language</li>
                <li>Help kids see how world events connect to everyday life</li>
                <li>Show that many issues don’t have just one right answer</li>
                <li>Encourage curiosity, empathy, and thinking out loud</li>
              </ul>
              <p className="italic mt-4">Every story ends with questions, because thinking doesn’t stop at reading.</p>
            </div>
          </section>

          {/* What We Believe */}
          <section className="space-y-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">What We Believe</h2>
            <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
              <p>We believe:</p>
              <ul className="list-none space-y-2">
                <li>Curiosity is a superpower</li>
                <li>Questions matter more than quick answers</li>
                <li>Calm explanations build confidence</li>
                <li>Kids are capable of deep thinking</li>
              </ul>
              <p className="font-medium text-primary mt-6">The world can feel big and confusing. Understanding it shouldn’t be.</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              <span className="font-heading text-xl font-bold text-muted-foreground">WhyPals</span>
            </div>
            <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
              <Link href="/about" className="text-primary font-bold hover:opacity-80 transition-opacity">About Us</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-muted-foreground/50">
              © 2026 Edu Foundations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
