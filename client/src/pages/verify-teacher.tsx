import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, UserPlus, FileCheck, Clock, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import logo from "@assets/whypals-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VerifyTeacher() {
  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up or log in to WhyPals with your email address.",
      icon: UserPlus,
      status: "info",
    },
    {
      number: 2,
      title: "Submit Verification Documents",
      description: "Upload one of the following documents to verify your teacher status:",
      icon: FileCheck,
      status: "warning",
      details: [
        "Valid Teacher ID Card",
        "School Employment Contract",
        "Official Letter from Your School",
        "Teaching Certificate or License",
      ],
    },
    {
      number: 3,
      title: "Wait for Approval",
      description: "Our team will review your documents within 1-3 business days. You'll receive an email once approved.",
      icon: Clock,
      status: "info",
    },
    {
      number: 4,
      title: "Start Uploading Content",
      description: "Once verified, access your Teacher Dashboard to upload lesson plans, worksheets, and educational materials.",
      icon: Upload,
      status: "success",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain" />
            WhyPals
          </Link>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Become a Verified Teacher
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            To ensure the quality of our marketplace, we verify all teachers before they can upload content. 
            Follow the steps below to get verified.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === 'success' ? 'bg-green-100 text-green-600' :
                      step.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Step {step.number}</span>
                      </div>
                      <h3 className="font-heading text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground mb-3">{step.description}</p>
                      
                      {step.details && (
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-gradient-to-br from-primary/10 to-purple-100/50 rounded-3xl p-8 text-center"
        >
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold mb-2">Verification Coming Soon</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our teacher verification system is currently under development. 
            Check back soon to submit your documents and become a verified teacher!
          </p>
          <Link href="/teachers">
            <Button className="rounded-full px-8">
              Return to Marketplace
            </Button>
          </Link>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/50">
            © 2026 Edu Foundations. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
