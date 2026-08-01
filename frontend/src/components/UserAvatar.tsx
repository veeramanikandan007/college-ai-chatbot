import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
import { User } from '../lib/auth';

interface UserAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'header' | 'lg' | 'xl' | number;
  className?: string;
  onClick?: () => void;
  showBorder?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  onClick,
  showBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute initials
  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Dimension mapping
  const sizeClasses: Record<string, { container: string; text: string; icon: number }> = {
    xs:     { container: 'w-6 h-6 rounded-md', text: 'text-[10px]', icon: 14 },
    sm:     { container: 'w-[34px] h-[34px] rounded-xl', text: 'text-[12px]', icon: 16 },
    md:     { container: 'w-[34px] h-[34px] rounded-xl', text: 'text-[12px]', icon: 16 },
    header: { container: 'w-10 h-10 rounded-[12px]', text: 'text-xs', icon: 16 },
    lg:     { container: 'w-[56px] h-[56px] rounded-xl', text: 'text-base', icon: 20 },
    xl:     { container: 'w-[72px] h-[72px] rounded-xl', text: 'text-xl', icon: 28 },
  };

  const currentSize = typeof size === 'string' ? sizeClasses[size] || sizeClasses.md : null;
  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  const initials = getInitials(user?.name);
  const borderClass = showBorder ? 'border border-[#D9A441]/30' : '';

  return (
    <div
      onClick={onClick}
      style={customStyle}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-all duration-200 ${
        currentSize ? currentSize.container : ''
      } ${borderClass} ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
    >
      {user?.avatar_url && !imageError ? (
        <img
          src={user.avatar_url}
          alt={user.name || 'User Avatar'}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover rounded-inherit"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0E2A6D] via-[#153B8A] to-[#1E4DB7] text-white font-heading font-bold shadow-xs">
          {user?.name ? (
            <span className={currentSize?.text}>{initials}</span>
          ) : (
            <UserRound size={currentSize?.icon || 18} strokeWidth={1.75} />
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
