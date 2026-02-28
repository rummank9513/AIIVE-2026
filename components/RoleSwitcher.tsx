'use client';

import React from 'react';
import { Role } from '@/lib/types';
import { User, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const roles: { id: Role; label: string; icon: React.ReactNode }[] = [
    { id: 'client1', label: 'Client 1', icon: <User className="w-4 h-4" /> },
    { id: 'client2', label: 'Client 2', icon: <Users className="w-4 h-4" /> },
    { id: 'officer', label: 'Officer', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            currentRole === role.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
          )}
        >
          {role.icon}
          {role.label}
        </button>
      ))}
    </div>
  );
}
