import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Check, X, User, Calendar, Mail, Clock, ArrowLeft, GraduationCap, Briefcase, FileText, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminTeachers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<UserType | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetch('/api/admin/session').then(res => {
      if (res.ok) {
        setIsLoggedIn(true);
      }
      setIsCheckingSession(false);
    }).catch(() => {
      setIsCheckingSession(false);
    });
  }, []);

  const { data: pendingTeachers, isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/teacher-verifications'],
    queryFn: async () => {
      const res = await fetch('/api/admin/teacher-verifications');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: isLoggedIn,
  });

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest('POST', '/api/admin/login', { password });
      return res.json();
    },
    onSuccess: (data: any) => {
      setIsLoggedIn(true);
      toast({ title: "Success", description: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Invalid password", variant: "destructive" });
    },
  });

  const verificationMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) => {
      const res = await fetch(`/api/admin/teacher-verifications/${userId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teacher-verifications'] });
      toast({ 
        title: "Success", 
        description: variables.action === 'approve' 
          ? "Teacher has been verified!" 
          : "Verification request has been rejected." 
      });
      setSelectedTeacher(null);
      setActionType(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update verification status", variant: "destructive" });
    },
  });

  const handleAction = (teacher: UserType, action: 'approve' | 'reject') => {
    setSelectedTeacher(teacher);
    setActionType(action);
  };

  const confirmAction = () => {
    if (selectedTeacher && actionType) {
      verificationMutation.mutate({ userId: selectedTeacher.id, action: actionType });
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Teacher Verification Management</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(password); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                placeholder="Enter admin password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl font-bold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <nav className="p-4 bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <h1 className="font-heading text-xl font-bold">Teacher Verification</h1>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border p-6 mb-6">
            <h2 className="font-heading text-2xl font-bold mb-2">Pending Verification Requests</h2>
            <p className="text-muted-foreground">
              Review and approve teacher accounts to allow them to sell paid content.
            </p>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl shadow-sm border p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading verification requests...</p>
            </div>
          ) : pendingTeachers && pendingTeachers.length > 0 ? (
            <div className="space-y-4">
              {pendingTeachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {teacher.profileImageUrl ? (
                        <img src={teacher.profileImageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-lg font-bold">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Mail className="w-4 h-4" />
                            {teacher.email}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                          Pending
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {teacher.bio && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Bio</p>
                              <p className="text-sm line-clamp-2">{teacher.bio}</p>
                            </div>
                          </div>
                        )}
                        {teacher.subjectsTaught && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Subjects</p>
                              <p className="text-sm">{teacher.subjectsTaught}</p>
                            </div>
                          </div>
                        )}
                        {teacher.experienceYears && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Experience</p>
                              <p className="text-sm">{teacher.experienceYears} years</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {teacher.verificationRequestedAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                          <Clock className="w-3 h-3" />
                          Requested: {new Date(teacher.verificationRequestedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}

                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => handleAction(teacher, 'approve')}
                          className="bg-green-600 hover:bg-green-700 gap-2"
                          disabled={verificationMutation.isPending}
                        >
                          <Check className="w-4 h-4" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(teacher, 'reject')}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                          disabled={verificationMutation.isPending}
                        >
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                There are no pending verification requests at the moment.
              </p>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!selectedTeacher && !!actionType} onOpenChange={() => { setSelectedTeacher(null); setActionType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              {actionType === 'approve' ? 'Approve Teacher?' : 'Reject Verification?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' 
                ? `This will verify ${selectedTeacher?.firstName} ${selectedTeacher?.lastName} and allow them to sell paid content on the marketplace.`
                : `This will reject the verification request for ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}. They will still be able to upload free content.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
