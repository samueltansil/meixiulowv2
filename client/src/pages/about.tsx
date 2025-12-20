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
          {/* What is WhyPals */}
          <section className="space-y-6 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary">What is WhyPals?</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              [Write about WhyPals here. Example: WhyPals is a fun and interactive learning platform designed for kids...]
            </p>
          </section>

          {/* Our Team */}
          <section className="space-y-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">Our Team</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              [Write about your team here. Example: We are a group of passionate educators and developers...]
            </p>
          </section>

          {/* Our Mission */}
          <section className="space-y-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              [Write about your mission here. Example: Our mission is to make learning accessible and enjoyable for everyone...]
            </p>
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
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
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
