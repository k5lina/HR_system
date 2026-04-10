import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout/Layout';
import LoginPage from './components/Auth/LoginPage';
import RequestList from './components/Requests/RequestList';
import RequestForm from './components/Requests/RequestForm';
import VacancyList from './components/Vacancies/VacancyList';
import VacancyForm from './components/Vacancies/VacancyForm';
import PublishedVacancyList from './components/PublishedVacancies/PublishedVacancyList';
import PublishedVacancyCard from './components/PublishedVacancies/PublishedVacancyCard';
import CandidateProfile from './components/Candidates/CandidateProfile';
import PhoneInterviewForm from './components/Selection/PhoneInterviewForm';
import MainInterviewForm from './components/Selection/MainInterviewForm';
import SecurityCheckForm from './components/Selection/SecurityCheckForm';
import MedicalCheckForm from './components/Selection/MedicalCheckForm';
import OfferForm from './components/Selection/OfferForm';
import SelectionPage from './components/Selection/SelectionPage';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import FunnelReport from './components/Analytics/FunnelReport';
import TimeReport from './components/Analytics/TimeReport';
import ReasonsReport from './components/Analytics/ReasonsReport';
import DirectoriesPage from './components/Directories/DirectoriesPage';
import HomePage from './components/Home/HomePage';

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: number[] }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role_id)) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="requests" element={<RequestList />} />
        <Route path="requests/new" element={<RequestForm />} />
        <Route path="requests/:id" element={<RequestForm />} />
        <Route path="vacancies" element={<PrivateRoute allowedRoles={[1, 2]}><VacancyList /></PrivateRoute>} />
        <Route path="vacancies/new" element={<PrivateRoute allowedRoles={[1, 2]}><VacancyForm /></PrivateRoute>} />
        <Route path="vacancies/:id" element={<PrivateRoute allowedRoles={[1, 2]}><VacancyForm /></PrivateRoute>} />
        <Route path="published" element={<PrivateRoute allowedRoles={[1, 2]}><PublishedVacancyList /></PrivateRoute>} />
        <Route path="published/:id" element={<PrivateRoute allowedRoles={[1, 2]}><PublishedVacancyCard /></PrivateRoute>} />
        <Route path="candidates/:id" element={<CandidateProfile />} />
        <Route path="selection" element={<PrivateRoute allowedRoles={[1, 2, 3]}><SelectionPage /></PrivateRoute>} />
        <Route path="selection/:candidateId/phone-interview" element={<PrivateRoute allowedRoles={[1, 2]}><PhoneInterviewForm /></PrivateRoute>} />
        <Route path="selection/:candidateId/main-interview" element={<PrivateRoute allowedRoles={[1, 2, 3]}><MainInterviewForm /></PrivateRoute>} />
        <Route path="selection/:candidateId/security-check" element={<PrivateRoute allowedRoles={[1, 2]}><SecurityCheckForm /></PrivateRoute>} />
        <Route path="selection/:candidateId/medical-check" element={<PrivateRoute allowedRoles={[1, 2]}><MedicalCheckForm /></PrivateRoute>} />
        <Route path="selection/:candidateId/offer" element={<PrivateRoute allowedRoles={[1, 2]}><OfferForm /></PrivateRoute>} />
        <Route path="analytics" element={<PrivateRoute allowedRoles={[1, 2, 3]}><AnalyticsPage /></PrivateRoute>} />
        <Route path="analytics/funnel" element={<PrivateRoute allowedRoles={[1, 2, 3]}><FunnelReport /></PrivateRoute>} />
        <Route path="analytics/time" element={<PrivateRoute allowedRoles={[1, 2, 3]}><TimeReport /></PrivateRoute>} />
        <Route path="analytics/reasons" element={<PrivateRoute allowedRoles={[1, 2, 3]}><ReasonsReport /></PrivateRoute>} />
        <Route path="directories" element={<PrivateRoute allowedRoles={[1]}><DirectoriesPage /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/requests" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
