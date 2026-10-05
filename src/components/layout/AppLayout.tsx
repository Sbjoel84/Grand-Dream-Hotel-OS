import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ToastContainer } from '../ui/ToastContainer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area (shifted right on desktop for 256px sidebar) */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <TopNav />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notifications Stack */}
      <ToastContainer />
    </div>
  );
};
