import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('Analitik');

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col min-w-0 md:ml-[280px] overflow-hidden bg-background">
        <MobileHeader />
        
        {activeTab === 'Dashboard' && <Dashboard />}
        {activeTab === 'Analitik' && <Analytics />}
        {/* Placeholder for other tabs */}
        {activeTab !== 'Dashboard' && activeTab !== 'Analitik' && (
          <div className="flex-1 flex items-center justify-center p-8 text-on-surface-variant">
            <p>Halaman {activeTab} sedang dalam pengembangan.</p>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
