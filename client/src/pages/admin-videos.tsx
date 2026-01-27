import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plus, Edit, Trash2, ArrowLeft, Save, X, Eye, Star, Lock, Shield, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import logo from "@assets/whypals-logo.png";
import type { Video } from "@shared/schema";

const CATEGORIES = ["Science", "Nature", "Sports", "World", "Fun", "Music", "Art"];

async function validateSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/session", { credentials: "include" });
    if (res.ok) {
      return true;
    }
  } catch {}
  return false;
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
        credentials: "include",
      });

      if (res.ok) {
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Access Admin Panel"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="link" size="sm">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function VideoForm({ 
  video, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  video?: Video; 
  onSave: (data: any) => void; 
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(video?.title || "");
  const [description, setDescription] = useState(video?.description || "");
  const [duration, setDuration] = useState(video?.duration || "");
  const [thumbnail, setThumbnail] = useState(video?.thumbnail || "");
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || "");
  const [category, setCategory] = useState(video?.category || "Science");
  const [isFeatured, setIsFeatured] = useState(video?.isFeatured || false);
  const [linkedStoryTitle, setLinkedStoryTitle] = useState(video?.linkedStoryTitle || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      duration,
      thumbnail,
      videoUrl,
      category,
      isFeatured,
      linkedStoryTitle: linkedStoryTitle || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title"
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          required
          data-testid="input-video-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the video..."
          rows={3}
          data-testid="input-video-description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input 
            id="duration"
            value={duration} 
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 5:30"
            required
            data-testid="input-video-duration"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-video-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedStoryTitle">Linked Story Title (for story connection)</Label>
        <Input 
          id="linkedStoryTitle"
          value={linkedStoryTitle} 
          onChange={(e) => setLinkedStoryTitle(e.target.value)}
          placeholder="Enter the exact story title to link this video"
          data-testid="input-video-linked-story"
        />
        <p className="text-xs text-muted-foreground">Leave empty if not linked to a specific story</p>
      </div>

      <ImageUploadField 
        label="Thumbnail URL"
        value={thumbnail}
        onChange={setThumbnail}
        placeholder="https://..."
        uploadEndpoint="/api/admin/upload/video-thumbnail"
        testid="input-video-thumbnail"
        previewClassName="w-32 h-20"
      />

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL</Label>
        <Input 
          id="videoUrl"
          value={videoUrl} 
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube URL, MP4 URL, or R2 path"
          required
          data-testid="input-video-url"
        />
        <p className="text-xs text-muted-foreground">
          Supports YouTube links, direct MP4 URLs, or R2 storage paths
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="featured" className="font-medium">Featured Video</Label>
          <p className="text-xs text-muted-foreground">Show this video in the featured slideshow on the videos page</p>
        </div>
        <Switch
          id="featured"
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
          data-testid="switch-video-featured"
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-video">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid="button-save-video">
          <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save Video"}
        </Button>
      </div>
    </form>
  );
}

function VideoRow({ video, onEdit, onDelete }: { video: Video; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b hover:bg-muted/50"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {video.thumbnail && (
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-16 h-10 object-cover rounded"
              />
              {video.isFeatured && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
              )}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{video.title}</p>
            <p className="text-xs text-muted-foreground">{video.duration}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
          {video.category}
        </span>
      </td>
      <td className="py-4 px-4">
        {video.isFeatured ? (
          <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
            <Star className="w-3 h-3 fill-current" /> Featured
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </td>
      <td className="py-4 px-4">
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Eye className="w-3 h-3" /> {video.views?.toLocaleString() || 0}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`button-edit-video-${video.id}`}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700" data-testid={`button-delete-video-${video.id}`}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function AdminVideos() {
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isSessionValid, isLoading: isCheckingSession } = useQuery({
    queryKey: ["adminSession"],
    queryFn: validateSession,
    retry: false,
    staleTime: 0
  });

  const isAuthenticated = !!isSessionValid;

  const { data: videos = [], isLoading, error } = useQuery<Video[]>({
    queryKey: ["/api/admin/videos"],
    queryFn: async () => {
      const res = await fetch("/api/admin/videos", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch videos");
      }
      return res.json();
    },
    retry: false,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create video");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/featured"] });
      setIsCreating(false);
      toast({ title: "Video created successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update video");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/featured"] });
      setEditingVideo(null);
      toast({ title: "Video updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete video");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/featured"] });
      toast({ title: "Video deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete video", variant: "destructive" });
    },
  });

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showPasswordLogin) {
      return <AdminLoginDialog onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ["adminSession"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
        setShowPasswordLogin(false);
      }} />;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-2 mb-6">Enter the admin password to access the video management panel.</p>
          <Button className="w-full mb-4" onClick={() => setShowPasswordLogin(true)}>
            Use Admin Password
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = (video: Video) => {
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      deleteMutation.mutate(video.id);
    }
  };

  if (error) {
    if (error.message === "Unauthorized") {
      return <AdminLoginDialog onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ["adminSession"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      }} />;
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Error</h1>
          <p className="text-muted-foreground text-sm mt-2 mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className="p-4 border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-heading text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <img src={logo} alt="WhyPals Logo" className="h-10 w-10 object-contain" />
            WhyPals
          </Link>
          
          <div className="hidden md:flex items-center gap-8 font-heading font-semibold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/admin/stories" className="hover:text-primary transition-colors">Admin: Stories</Link>
            <span className="text-primary">Admin: Videos</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Video Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Create, edit, and manage videos for WhyPals
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)} data-testid="button-create-video">
            <Plus className="w-4 h-4 mr-2" /> New Video
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-heading">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-2xl">
            <p className="text-muted-foreground font-heading text-lg mb-4">No videos yet</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create your first video
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-heading text-sm">Video</th>
                  <th className="text-left py-3 px-4 font-heading text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-heading text-sm">Featured</th>
                  <th className="text-left py-3 px-4 font-heading text-sm">Views</th>
                  <th className="text-right py-3 px-4 font-heading text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <VideoRow
                    key={video.id}
                    video={video}
                    onEdit={() => setEditingVideo(video)}
                    onDelete={() => handleDelete(video)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Create New Video</DialogTitle>
            </DialogHeader>
            <VideoForm
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreating(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Edit Video</DialogTitle>
            </DialogHeader>
            {editingVideo && (
              <VideoForm
                video={editingVideo}
                onSave={(data) => updateMutation.mutate({ id: editingVideo.id, data })}
                onCancel={() => setEditingVideo(null)}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>

      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/50">
            Admin Panel - WhyPals for Kids
          </p>
        </div>
      </footer>
    </div>
  );
}
