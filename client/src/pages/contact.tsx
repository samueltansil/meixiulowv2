import { Link } from "wouter";
import logo from "@assets/whypals-logo.png";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
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

      <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <Card className="max-w-md w-full shadow-lg border-2 border-primary/10">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-heading text-3xl font-bold text-primary">Contact Us</CardTitle>
            <p className="text-muted-foreground text-lg">
              We'd love to hear from you!
            </p>
          </CardHeader>
          <CardContent className="space-y-8 text-center pb-8">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                For general inquiries, support, or feedback, please email us at:
              </p>
              <a 
                href="mailto:admin@whypals.com" 
                className="block text-2xl font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                admin@whypals.com
              </a>
            </div>
            
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                We aim to respond to all inquiries within 24-48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              <span className="font-heading text-xl font-bold text-muted-foreground">WhyPals</span>
            </div>
            <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">Privacy & Safety</Link>
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
