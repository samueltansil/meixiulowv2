import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from "@assets/whypals-logo.png";
import { ShieldCheck, Mail, Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyParent() {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    if (!search) return;

    const searchToken = new URLSearchParams(search).get("token");
    if (!searchToken) return;

    const verifyWithToken = async () => {
      setAutoVerifying(true);
      setIsVerifying(true);
      try {
        await apiRequest("POST", "/api/auth/verify-parent", { token: searchToken });
        setIsSuccess(true);
        toast({
          title: "Verification successful",
          description: "Your child's account has been approved. You can now help them log in.",
        });
        setTimeout(() => navigate("/login"), 3000);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: error.message || "The verification link may have expired or been used.",
        });
      } finally {
        setIsVerifying(false);
        setAutoVerifying(false);
      }
    };

    verifyWithToken();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Code required",
        description: "Please enter the verification code from your email.",
      });
      return;
    }

    setIsVerifying(true);

    try {
      await apiRequest("POST", "/api/auth/verify-parent", { code: code.trim() });
      setIsSuccess(true);
      toast({
        title: "Verification successful",
        description: "Your child's account has been approved. You can now help them log in.",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "The code may be incorrect or expired.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <img src={logo} alt="WhyPals" className="h-20 w-20 mx-auto mb-4" />
          </Link>
          <h1 className="font-heading text-3xl font-bold text-primary">Parent or Guardian Verification</h1>
          <p className="text-muted-foreground mt-2">
            Approve your WhyPals account using the link or code we emailed you.
          </p>
        </div>

        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-2 justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Confirm Your Consent
            </CardTitle>
            <CardDescription className="text-center">
              Check your email for a verification link or a 6-digit code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-700">Verification Complete</h3>
                <p className="text-muted-foreground">
                  Your child's account has been activated. You can now help them log in to start learning.
                </p>
                <Button onClick={() => navigate("/login")} className="w-full mt-4">
                  Go to Login
                </Button>
              </div>
            ) : (
              <>
                {autoVerifying && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Verifying your approval link. This may take a moment.</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <Mail className="h-4 w-4" />
                  <span>
                    If the link does not open automatically, enter the one-time code from your email below.
                  </span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="text-center tracking-[0.3em] text-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={isVerifying || !code.trim()}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground text-center">
              <p>
                By approving, you confirm that you are the child's parent or legal guardian and consent to the creation of their WhyPals learning account.
              </p>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
