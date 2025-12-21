import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  showPreview?: boolean;
  uploadEndpoint?: string;
  token?: string | null;
  testid?: string;
  previewClassName?: string;
}

export function ImageUploadField({ 
  label, 
  value, 
  onChange, 
  placeholder = "https://...",
  showPreview = true,
  uploadEndpoint = "/api/admin/upload/game-image",
  token,
  testid,
  previewClassName = "w-32 h-32"
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['x-admin-token'] = token;
      }

      const uploadRes = await fetch(uploadEndpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await uploadRes.json();
      onChange(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={testid}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={testid}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          data-testid={testid}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid={testid ? `${testid}-file` : undefined}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          data-testid={testid ? `${testid}-upload-button` : undefined}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>
      {showPreview && value && (
        <div className={`mt-2 relative rounded-lg overflow-hidden border ${previewClassName}`}>
           <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
