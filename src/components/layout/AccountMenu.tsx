import React, { useEffect, useRef, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccountMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const profile = user.user_metadata;
  const displayName = [profile?.full_name, profile?.name, profile?.display_name]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const imageUrl = [profile?.avatar_url, profile?.picture]
    .find((value): value is string => typeof value === 'string' && value.startsWith('https://'));
  const showAvatar = Boolean(imageUrl && imageUrl !== failedAvatar);

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut();
      setOpen(false);
    } catch {
      setError('Sign out failed. Please try again.');
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen((wasOpen) => !wasOpen); setError(null); }}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        title="Account"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 dark:border-white/15 bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-200 hover:border-[#84CC16] hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#84CC16]"
      >
        {showAvatar ? (
          <img
            src={imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setFailedAvatar(imageUrl ?? null)}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserRound className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-[#0E172A] shadow-xl p-2 z-50 text-neutral-900 dark:text-neutral-100">
          <div className="px-2.5 py-2 border-b border-neutral-100 dark:border-white/10">
            {displayName && (
              <p className="text-sm font-semibold truncate" title={displayName}>
                {displayName}
              </p>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 break-all">
              {user.email ?? 'Signed-in account'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="w-full mt-1 px-2.5 py-2 text-sm flex items-center gap-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out
          </button>
          {error && <p role="alert" className="px-2.5 pb-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  );
};
