import { Link } from "wouter";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full border-2 border-muted animate-pulse bg-muted" />
    );
  }

  if (!user) {
    return (
      <Link 
        href="/auth"
        className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
      >
        <User className="w-5 h-5 text-primary/70" />
      </Link>
    );
  }

  return (
    <Link 
      href="/settings"
      className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all overflow-hidden"
    >
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <User className="w-5 h-5 text-primary/70" />
      )}
    </Link>
  );
}
