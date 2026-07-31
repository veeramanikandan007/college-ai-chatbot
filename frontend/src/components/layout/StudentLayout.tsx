import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import HeaderBar from '../HeaderBar';
import ProfileDrawer from '../ProfileDrawer';
import { useAuth } from '../../hooks/useAuth';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#1F2937] dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar
          currentChatTitle="CollegeMate AI"
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLogin={() => {}}
          isLoggedIn={!!user}
        />

        <div className="flex flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={logout}
      />
    </div>
  );
}
