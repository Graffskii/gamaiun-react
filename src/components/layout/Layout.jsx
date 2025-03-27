import React, { useContext } from 'react';
import LeftSidebar from './LeftSidebar';
import MainChat from './MainChat';
import RightSidebar from './RightSidebar';
import SupportModal from '../modals/SupportModal';
import { useAppContext } from '../../contexts/AppContext';

const Layout = () => {
  const { showSupportModal } = useAppContext();

  return (
    <div className="flex h-screen bg-gray-800 text-gray-100">
      <LeftSidebar />
      <MainChat />
      <RightSidebar />
      {showSupportModal && <SupportModal />}
    </div>
  );
};

export default Layout;