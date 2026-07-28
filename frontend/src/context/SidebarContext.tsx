import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isPinned: boolean;
  toggleSidebar: () => void;
  setIsOpen: (open: boolean) => void;
  togglePin: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('sidebarPinned') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarPinned', String(isPinned));
    if (isPinned) {
      setIsOpen(true);
    }
  }, [isPinned]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const togglePin = () => setIsPinned((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, isPinned, toggleSidebar, setIsOpen, togglePin }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
