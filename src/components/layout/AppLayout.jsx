import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans relative w-full max-w-full overflow-x-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <main
        className={`pt-20 pb-28 md:pb-12 px-3 sm:px-6 transition-all duration-200 flex-1 min-w-0 w-full ${
          collapsed ? 'md:pl-24' : 'md:pl-72'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};
