import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBannerSchema, type Banner, type InsertBanner } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ADMIN_TOKEN_KEY = 'newspals_admin_token';

function getStoredToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function setStoredToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearStoredToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function validateSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  
  try {
    const res = await fetch("/api/admin/session", {
      headers: { "x-admin-token": token },
    });
    if (!res.ok) {
      clearStoredToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
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

export default function AdminBanners() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isValid = await validateSession();
    setIsAuthenticated(isValid);
    setIsCheckingAuth(false);
  };

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
    queryFn: async () => {
      const token = getStoredToken();
      const res = await fetch("/api/banners", {
        headers: {
          "x-admin-token": token || "",
        },
      });
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Failed to fetch banners");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const form = useForm<InsertBanner>({
    resolver: zodResolver(insertBannerSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      active: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBanner) => {
      const token = getStoredToken();
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify(data),
      });
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Failed to create banner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setIsOpen(false);
      form.reset();
      toast({ title: "Success", description: "Banner created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = getStoredToken();
      const res = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token || "",
        },
      });
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Failed to delete banner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Success", description: "Banner deleted successfully" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const token = getStoredToken();
      const res = await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({ active }),
      });
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Failed to update banner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const token = getStoredToken();
      const res = await fetch("/api/admin/upload/banner", {
        method: "POST",
        headers: {
          "x-admin-token": token || "",
        },
        body: formData,
      });
      
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        throw new Error("Session expired");
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }
      
      const data = await res.json();
      form.setValue("imageUrl", data.imageUrl);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: InsertBanner) => {
    createMutation.mutate(data);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginDialog onSuccess={() => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
    }} />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Banner Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Weekly Theme: Space" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <Input {...field} placeholder="/api/images/..." readOnly />
                        </FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createMutation.isPending || isUploading}>
                  {createMutation.isPending ? "Creating..." : "Create Banner"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : banners.map((banner) => (
          <div key={banner.id} className="border rounded-lg p-4 space-y-4 bg-card">
            <div className="aspect-[3/1] relative rounded-md overflow-hidden bg-muted">
              <img src={banner.imageUrl} alt={banner.title} className="object-cover w-full h-full" />
            </div>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{banner.title}</h3>
              <Switch
                checked={banner.active}
                onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: banner.id, active: checked })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this banner?")) {
                    deleteMutation.mutate(banner.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
