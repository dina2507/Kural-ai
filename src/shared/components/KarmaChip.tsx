import React from 'react';

interface KarmaChipProps {
  name: string;
  karma: number;
  avatarUrl?: string;
  className?: string;
}

export function KarmaChip({ name, karma, avatarUrl, className = '' }: KarmaChipProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-6 h-6 rounded-full object-cover" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary-subtle text-primary flex items-center justify-center text-xs font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary leading-tight">{name}</span>
        <span className="text-xs text-text-tertiary font-mono leading-tight flex items-center gap-1">
          <span className="text-amber-500">★</span> {karma} karma
        </span>
      </div>
    </div>
  );
}
