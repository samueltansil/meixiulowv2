import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from "@assets/generated_images/cute_owl_mascot_for_kids_news_site.png";
import { GraduationCap, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function SelectRole() {
  const { user, setRole, isSettingRole, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
    if (user?.userRole) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleRoleSelect = async (role: 'teacher' | 'student') => {
    try {
      await setRole(role);
      toast({
        title: role === 'teacher' ? "Welcome, Teacher!" : "Welcome, Student!",
        description: role === 'teacher' 
          ? "Your teacher account is ready. You can now access the teacher dashboard."
          : "Your student account is ready. Start exploring news and games!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error.message || "Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="NewsPals" className="h-24 w-24 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-primary">One More Step!</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Are you joining as a teacher or a student?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all h-full"
              onClick={() => !isSettingRole && handleRoleSelect('teacher')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <GraduationCap className="h-10 w-10 text-amber-600" />
                </div>
                <CardTitle className="font-heading text-2xl">I'm a Teacher</CardTitle>
                <CardDescription className="text-base">
                  Share educational resources and inspire young learners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Create and share teaching materials
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Access the Teacher Resource Marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Sell educational content (after verification)
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4 gap-2" 
                  size="lg"
                  variant="outline"
                  disabled={isSettingRole}
                >
                  {isSettingRole ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4" />
                      Continue as Teacher
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all h-full"
              onClick={() => !isSettingRole && handleRoleSelect('student')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="font-heading text-2xl">I'm a Student</CardTitle>
                <CardDescription className="text-base">
                  Explore news, watch videos, and play educational games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Read kid-friendly news articles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Play fun educational games
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Earn points and track progress
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4 gap-2" 
                  size="lg"
                  disabled={isSettingRole}
                >
                  {isSettingRole ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      Continue as Student
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
