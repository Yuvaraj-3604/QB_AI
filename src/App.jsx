import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from '@/api/base44Client';

// Public pages
import Home from '@/Pages/Home';
import Login from '@/Pages/Login';
import Signup from '@/Pages/Signup';
import ForgotPassword from '@/Pages/ForgotPassword';
import BookDemo from '@/Pages/BookDemo';

// Shared authenticated pages
import Dashboard from '@/Pages/Dashboard';
import Events from '@/Pages/Events';
import Settings from '@/Pages/Settings';
import HelpSupport from '@/Pages/HelpSupport';

// Host-only pages
import CreateEvent from '@/Pages/CreateEvent';
import EventDetails from '@/Pages/EventDetails';
import Attendees from '@/Pages/Attendees';
import Analytics from '@/Pages/Analytics';
import Marketing from '@/Pages/Marketing';
import Leaderboard from '@/Pages/Leaderboard';
import AILeaderboardResults from '@/Pages/AILeaderboardResults';
import ProjectMonitoringFeed from '@/Pages/ProjectMonitoringFeed';
import HostRequests from '@/Pages/HostRequests';

// Attendee-only pages
import MyRequests from '@/Pages/MyRequests';
import EventParticipation from '@/Pages/EventParticipation';

import { Toaster } from '@/Components/ui/toaster';

// Protected route wrapper
function Protected({ children, requireRole }) {
    const user = api.auth.me();
    if (!user) return <Navigate to="/login" replace />;
    if (requireRole && user.role !== requireRole) {
        return <Navigate to={user.role === 'host' ? '/Dashboard' : '/Events'} replace />;
    }
    return children;
}

function App() {
    return (
        <Router>
            <Toaster />
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/book-demo" element={<BookDemo />} />

                {/* Authenticated (any role) */}
                <Route path="/Dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/Events" element={<Protected><Events /></Protected>} />
                <Route path="/Settings" element={<Protected><Settings /></Protected>} />
                <Route path="/HelpSupport" element={<Protected><HelpSupport /></Protected>} />

                {/* Host only */}
                <Route path="/CreateEvent" element={<Protected requireRole="host"><CreateEvent /></Protected>} />
                <Route path="/EventDetails" element={<Protected requireRole="host"><EventDetails /></Protected>} />
                <Route path="/Attendees" element={<Protected requireRole="host"><Attendees /></Protected>} />
                <Route path="/Analytics" element={<Protected requireRole="host"><Analytics /></Protected>} />
                <Route path="/Marketing" element={<Protected requireRole="host"><Marketing /></Protected>} />
                <Route path="/Leaderboard" element={<Protected requireRole="host"><Leaderboard /></Protected>} />
                <Route path="/AIResults" element={<Protected requireRole="host"><AILeaderboardResults /></Protected>} />
                <Route path="/Monitoring" element={<Protected requireRole="host"><ProjectMonitoringFeed /></Protected>} />
                <Route path="/HostRequests" element={<Protected requireRole="host"><HostRequests /></Protected>} />

                {/* Attendee only */}
                <Route path="/MyRequests" element={<Protected requireRole="attendee"><MyRequests /></Protected>} />
                <Route path="/EventParticipation" element={<Protected requireRole="attendee"><EventParticipation /></Protected>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
