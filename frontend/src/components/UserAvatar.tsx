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

  // Dimension mapping — Desktop header: 40px circle, Mobile header: 36px circle
  const sizeClasses: Record<string, { container: string; text: string; icon: number }> = {
    xs:     { container: 'w-6 h-6 rounded-full', text: 'text-[10px]', icon: 12 },
    sm:     { container: 'w-8 h-8 rounded-full', text: 'text-[11px]', icon: 14 },
    md:     { container: 'w-9 h-9 rounded-full', text: 'text-[12px]', icon: 16 },
    header: { container: 'w-9 h-9 sm:w-10 sm:h-10 rounded-full', text: 'text-[12px]', icon: 16 },
    lg:     { container: 'w-14 h-14 rounded-full', text: 'text-[16px]', icon: 20 },
    xl:     { container: 'w-18 h-18 rounded-full', text: 'text-[20px]', icon: 28 },
  };

  const currentSize = typeof size === 'string' ? sizeClasses[size] || sizeClasses.md : null;
  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  const initials = getInitials(user?.name);
  const borderClass = showBorder ? 'border border-[#D1D5DB] dark:border-[#3F3F46]' : '';

  return (
    <div
      onClick={onClick}
      style={customStyle}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-all duration-150 ${
        currentSize ? currentSize.container : ''
      } ${borderClass} ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
    >
      {user?.avatar_url && !imageError ? (
        <img
          src={user.avatar_url}
          alt={user.name || 'User Avatar'}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] font-bold shadow-xs">
          {user?.name ? (
            <span className={currentSize?.text}>{initials}</span>
          ) : (
            <UserRound size={currentSize?.icon || 16} />
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
