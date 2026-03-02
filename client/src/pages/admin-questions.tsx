import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Question, Story } from "@shared/schema";
import logo from "@/assets/whypals-logo.png";

const ADMIN_TOKEN_KEY = 'whypals_admin_token';

function getStoredToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function setStoredToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function AdminLoginDialog({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        setStoredToken(data.token);
        toast({ title: "Admin access granted!" });
        onSuccess();
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Access Required</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminQuestions() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check admin session
  useEffect(() => {
    const checkSession = async () => {
      const token = getStoredToken();
      if (!token) return;

      try {
        const res = await fetch("/api/admin/session", {
          headers: { "x-admin-token": token }
        });
        if (res.ok) setIsAdmin(true);
      } catch (e) {
        console.error("Session check failed", e);
      }
    };
    checkSession();
  }, []);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/admin/questions"],
    enabled: isAdmin,
    meta: {
      headers: { "x-admin-token": getStoredToken() || "" }
    }
  });

  const { data: stories } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: { id: number, answer: string, isPublished: boolean }) => {
      const res = await fetch(`/api/admin/questions/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getStoredToken() || ""
        },
        body: JSON.stringify({
          answer: data.answer,
          isPublished: data.isPublished,
          answeredAt: data.isPublished ? new Date().toISOString() : null
        })
      });
      
      if (!res.ok) throw new Error("Failed to update question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      setEditingQuestion(null);
      toast({ title: "Question updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update question", variant: "destructive" });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": getStoredToken() || ""
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      toast({ title: "Question deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete question", variant: "destructive" });
    }
  });

  const getStoryTitle = (storyId: number) => {
    return stories?.find(s => s.id === storyId)?.title || "Unknown Story";
  };

  const openEditDialog = (q: Question) => {
    setEditingQuestion(q);
    setAnswerText(q.answer || "");
    setIsPublished(q.isPublished || false);
  };

  const handleSave = () => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({
        id: editingQuestion.id,
        answer: answerText,
        isPublished: isPublished
      });
    }
  };

  if (!isAdmin) {
    return <AdminLoginDialog onSuccess={() => setIsAdmin(true)} />;
  }

  const filteredQuestions = questions?.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (q.answer && q.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/stories">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
              <img src={logo} alt="WhyPals" className="h-8 w-8" />
              Question Moderation
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search questions..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Total: {questions?.length || 0}</span>
            <span>•</span>
            <span>Published: {questions?.filter(q => q.isPublished).length || 0}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions?.map((q) => (
              <Card key={q.id} className={q.isPublished ? "border-green-200 bg-green-50/30" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Story: <span className="font-medium text-foreground">{getStoryTitle(q.storyId)}</span>
                        </div>
                        <h3 className="text-xl font-bold">{q.question}</h3>
                        <div className="text-xs text-muted-foreground mt-1">
                          Asked: {format(new Date(q.createdAt), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                      
                      {q.answer && (
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm font-semibold text-purple-600 mb-1">Answer:</div>
                          <p className="text-gray-700">{q.answer}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex items-center gap-2 mb-2">
                        {q.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Unpublished
                          </span>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(q)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {q.answer ? "Edit Answer" : "Answer"}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this question?") && q.id) {
                            deleteQuestionMutation.mutate(q.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredQuestions?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No questions found
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {editingQuestion?.question}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea 
                id="answer" 
                value={answerText} 
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write a helpful, educational answer..."
                className="min-h-[150px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="published" 
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">Publish to "Big Why" page</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateQuestionMutation.isPending}>
              {updateQuestionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}