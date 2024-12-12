import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Home from './home.jsx';
import './index.css';
import Register from "./components/Register.jsx";
import './styles/Register.css';
import Hub from './components/Hub.jsx';
import './styles/Hub.css';
import Planets from './components/PlanIT.jsx';
import './styles/PlanIT.css';
import PlanetSettings from './components/PlanetSettings.jsx';
import './styles/PlanetSettings.css';
import Logout from './components/Logout.jsx';
import UserSettings from './components/UserSettings.jsx';
import './styles/UserSettings.css';


createRoot(document.getElementById('root')).render(
  //<StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/planets/:planetId" element={<Planets />} />
            <Route path="/planets/:planetId/settings/" element={<PlanetSettings />} />
            <Route path="/users/:userId/settings/" element={<UserSettings />} />
      </Routes>
    </Router>
  //</StrictMode>,
)
