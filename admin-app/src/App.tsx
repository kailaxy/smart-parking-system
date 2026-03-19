import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { ParkingAreasPage } from './pages/ParkingAreasPage';
import { SlotMonitorPage } from './pages/SlotMonitorPage';

function App() {
  const displayName = 'Dashboard operator';

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout displayName={displayName} />}>
          <Route path="/" element={<DashboardHomePage />} />
          <Route path="/areas" element={<ParkingAreasPage />} />
          <Route path="/slots" element={<SlotMonitorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
