import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, FileText, Video, HelpCircle, BookOpen, Package, Upload, User as UserIcon, Save, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import logo from "@assets/generated_images/cute_owl_mascot_for_kids_news_site.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { COURSEWORK_TYPES, SUBJECTS, type CourseworkItem, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function TeacherDashboard() {
  const { user: currentUser, requestVerification, isRequestingVerification } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseworkItem | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itemType: '',
    subject: '',
    linkUrl: '',
    price: 0,
    isPublished: false,
  });

  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    subjectsTaught: '',
    experienceYears: 0,
  });

  const { data: coursework = [], isLoading } = useQuery<CourseworkItem[]>({
    queryKey: ["/api/teacher/coursework"],
    enabled: !!currentUser && currentUser?.userRole === 'teacher',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/teacher/coursework', { ...data, price: Math.round(data.price * 100) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/coursework"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Success", description: "Coursework created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create coursework", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest('PUT', `/api/teacher/coursework/${id}`, { ...data, price: Math.round(data.price * 100) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/coursework"] });
      setEditingItem(null);
      resetForm();
      toast({ title: "Success", description: "Coursework updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update coursework", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/teacher/coursework/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/coursework"] });
      toast({ title: "Success", description: "Coursework deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete coursework", variant: "destructive" });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return apiRequest('PUT', '/api/teacher/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
      toast({ title: "Success", description: "Profile updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        bio: currentUser.bio || '',
        subjectsTaught: currentUser.subjectsTaught || '',
        experienceYears: currentUser.experienceYears || 0,
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profileData);
  };

  const handleRequestVerification = async () => {
    try {
      await requestVerification();
      setIsVerificationModalOpen(false);
      setShowVerificationSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"], exact: true });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to request verification", 
        variant: "destructive" 
      });
    }
  };

  const getVerificationStatusBadge = () => {
    const status = currentUser?.teacherVerificationStatus;
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> Verified
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
          <Clock className="w-4 h-4" /> Pending Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
        <AlertCircle className="w-4 h-4" /> Not Verified
      </span>
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      itemType: '',
      subject: '',
      linkUrl: '',
      price: 0,
      isPublished: false,
    });
  };

  const handleEdit = (item: CourseworkItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      itemType: item.itemType,
      subject: item.subject || '',
      linkUrl: item.linkUrl || '',
      price: (item.price || 0) / 100,
      isPublished: item.isPublished,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf_worksheet':
      case 'unit_plan':
      case 'lesson_bundle':
      case 'homework_pack':
      case 'reading_comprehension':
      case 'project_assignment':
        return FileText;
      case 'video':
        return Video;
      case 'quiz':
        return HelpCircle;
      default:
        return Package;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to access the teacher dashboard.</p>
        </div>
      </div>
    );
  }

  if (currentUser && currentUser.userRole !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="font-heading text-2xl font-bold mb-4">Teacher Access Required</h1>
          <p className="text-muted-foreground mb-6">You need a teacher account to access this dashboard.</p>
          <Link href="/settings">
            <Button className="rounded-full font-bold">Become a Teacher</Button>
          </Link>
        </div>
      </div>
    );
  }

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Solar System Worksheet Bundle"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your coursework..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={formData.itemType} onValueChange={(v) => setFormData({ ...formData, itemType: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {COURSEWORK_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkUrl">Link URL (YouTube, Google Drive, etc.)</Label>
        <Input
          id="linkUrl"
          value={formData.linkUrl}
          onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          disabled={currentUser?.teacherVerificationStatus !== 'verified'}
        />
        {currentUser?.teacherVerificationStatus !== 'verified' && (
          <p className="text-sm text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Verification required to set a price. <button type="button" onClick={() => setIsVerificationModalOpen(true)} className="underline font-medium">Get verified</button>
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="isPublished" className="cursor-pointer">Publish immediately</Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingItem ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditingItem(null); resetForm(); }}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teachers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary">
              <img src={logo} alt="NewsPals Logo" className="h-10 w-10 object-contain" />
              Teacher Dashboard
            </Link>
          </div>
          <Link href={`/teacher/${currentUser?.id}`}>
            <Button variant="outline" className="rounded-full">View My Profile</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-border mb-8"
        >
          <button
            onClick={() => setShowProfileSettings(!showProfileSettings)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-heading text-lg font-bold">Profile Settings</h2>
                <p className="text-sm text-muted-foreground">Update your bio, subjects, and experience</p>
              </div>
            </div>
            {showProfileSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showProfileSettings && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleProfileSubmit}
              className="mt-6 space-y-4 pt-4 border-t"
            >
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell other teachers about yourself..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectsTaught">Subjects You Teach</Label>
                  <Input
                    id="subjectsTaught"
                    value={profileData.subjectsTaught}
                    onChange={(e) => setProfileData({ ...profileData, subjectsTaught: e.target.value })}
                    placeholder="e.g., Math, Science, English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Years of Experience</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    value={profileData.experienceYears || ''}
                    onChange={(e) => setProfileData({ ...profileData, experienceYears: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <Button type="submit" className="gap-2" disabled={profileMutation.isPending}>
                <Save className="w-4 h-4" />
                {profileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </motion.form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-border mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-bold">Verification Status</h2>
                  {getVerificationStatusBadge()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.teacherVerificationStatus === 'verified' 
                    ? "You're verified and can sell coursework!" 
                    : currentUser?.teacherVerificationStatus === 'pending'
                    ? "Your verification is being reviewed by our team."
                    : "Get verified to sell your educational materials"}
                </p>
              </div>
            </div>
            {currentUser?.teacherVerificationStatus !== 'verified' && currentUser?.teacherVerificationStatus !== 'pending' && (
              <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full gap-2">
                    <ShieldCheck className="w-4 h-4" /> Get Verified
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-xl flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-amber-500" />
                      Become a Verified Teacher
                    </DialogTitle>
                    <DialogDescription className="pt-4 text-base">
                      Verification allows you to sell educational materials on NewsPals and earn money from your content.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <h4 className="font-semibold">Benefits of Verification:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Sell your educational materials and earn money
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Get a verified badge on your profile
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Higher visibility in the marketplace
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Build trust with other educators
                      </li>
                    </ul>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Before you request verification</AlertTitle>
                      <AlertDescription>
                        Please complete your profile with your bio, subjects taught, and years of experience. This helps our team review your application.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsVerificationModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRequestVerification} disabled={isRequestingVerification} className="gap-2">
                      {isRequestingVerification ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Request Verification
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">My Coursework</h1>
            <p className="text-muted-foreground">Manage and upload your educational content</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full font-bold gap-2">
                <Plus className="w-4 h-4" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Create New Coursework</DialogTitle>
              </DialogHeader>
              <FormContent />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your coursework...</p>
          </div>
        ) : coursework.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-3xl">
            <Upload className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-heading text-2xl font-bold mb-2">No Coursework Yet</h2>
            <p className="text-muted-foreground mb-6">Start sharing your educational content with the world!</p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-full font-bold gap-2">
              <Plus className="w-4 h-4" /> Create Your First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {coursework.map((item) => {
              const TypeIcon = getTypeIcon(item.itemType);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{COURSEWORK_TYPES.find(t => t.id === item.itemType)?.label || item.itemType}</span>
                        <span>•</span>
                        <span>${((item.price || 0) / 100).toFixed(2)}</span>
                        <span>•</span>
                        <span className={item.isPublished ? "text-green-600" : "text-orange-500"}>
                          {item.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this item?')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) { setEditingItem(null); resetForm(); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Edit Coursework</DialogTitle>
            </DialogHeader>
            <FormContent />
          </DialogContent>
        </Dialog>

        <Dialog open={showVerificationSuccess} onOpenChange={setShowVerificationSuccess}>
          <DialogContent className="max-w-md text-center">
            <div className="py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-center">Verification Request Submitted!</DialogTitle>
                <DialogDescription className="text-center pt-4 text-base space-y-4">
                  <p>
                    Thank you for requesting verification! We've received your application and our team is now reviewing your profile.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                    <p className="font-semibold text-blue-800 mb-2">What happens next?</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Our team will review your profile information</li>
                      <li>• We'll verify your teaching credentials</li>
                      <li>• You'll be notified once approved</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-amber-600 font-medium">
                    <Clock className="w-5 h-5" />
                    <span>Expected review time: 1-3 business days</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    In the meantime, you can continue uploading free content. Once verified, you'll be able to set prices for your materials.
                  </p>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button onClick={() => setShowVerificationSuccess(false)} className="rounded-full font-bold px-8">
                  Got it!
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
