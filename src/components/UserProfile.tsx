"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Loader2 } from "lucide-react";

export function UserProfile() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setShowMenu(false);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="
          flex items-center gap-2 px-3 py-1.5 rounded text-xs
          border border-border
          hover:border-primary
          transition-colors
        "
      >
        <User size={14} />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="
          flex items-center gap-2 px-2 py-1.5 rounded
          hover:bg-secondary
          transition-colors
        "
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-foreground hidden md:inline max-w-[120px] truncate">
          {displayName}
        </span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-foreground font-medium truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="
              w-full px-4 py-2 text-left text-xs text-muted-foreground
              hover:bg-secondary hover:text-foreground
              transition-colors
              flex items-center gap-2
              disabled:opacity-50
            "
          >
            {signingOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      )}
    </div>
  );
}
