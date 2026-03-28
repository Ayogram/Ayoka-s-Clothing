import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 40, className = "" }) => {
  const getInitials = (userName: string | null) => {
    if (!userName) return "AY";
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-gold-500/30 bg-zinc-100 dark:bg-zinc-900 shadow-inner shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img 
          src={src} 
          alt={name || "User Avatar"} 
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      
      {!src && (
        <span className="text-[10px] sm:text-xs font-bold gold-text tracking-widest pointer-events-none">
          {getInitials(name || "")}
        </span>
      )}
    </div>
  );
};

export default Avatar;
