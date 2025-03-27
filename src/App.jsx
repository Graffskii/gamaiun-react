import React from 'react';
import Layout from './components/layout/Layout';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;