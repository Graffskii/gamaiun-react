import React, { useContext } from 'react';
import LeftSidebar from './LeftSidebar';
import MainChat from './MainChat';
import RightSidebar from './RightSidebar';
import SupportModal from '../modals/SupportModal';
import { AppContext } from '../../contexts/AppContext';

const Layout = () => {
  const { showSupportModal } = useContext(AppContext);

  return (
    <div className="flex h-screen bg-[#0F172A] text-gray-100">
      <LeftSidebar />
      <MainChat />
      <RightSidebar />
      {showSupportModal && <SupportModal />}
    </div>
  );
};

export default Layout;