
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TitleBar from './components/layout/TitleBar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        {/* Hover zone for scrollbar */}
        <div className="hover-zone" />
        
        <TitleBar />
        
        <div className="flex-1 flex overflow-hidden scroll-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
