import { useLocation, useParams, Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { getDefaultAppRoute } from '../../lib/appRoutes';
import EventsPage from './EventsPage';
import EventDetailPage from './EventDetailPage';
import AdminDashboardPage from './AdminDashboardPage';
import EditorDashboardPage from './EditorDashboardPage';
import ComplaintsPage from './ComplaintsPage';
import AdminTeamPage from './AdminTeamPage';
import SettingsPage from './SettingsPage';

export default function MediaFlowRouter() {
  const { isEditor, isAdmin, role } = useRole();
  const { pathname } = useLocation();
  const { eventId } = useParams();

  const isDashboard = pathname.endsWith('/dashboard');
  const isEditorProgress = pathname.endsWith('/editor-progress');
  const isEventsList = !eventId && pathname.endsWith('/events');
  const isEventDetail = Boolean(eventId);
  const isComplaints = pathname.endsWith('/complaints');
  const isTeam = pathname.endsWith('/team');
  const isSettings = pathname.endsWith('/settings');

  if (isTeam && !isAdmin) {
    return <Navigate to={getDefaultAppRoute(role)} replace />;
  }

  // Editor Progress is now part of the admin Dashboard tab
  if (isEditorProgress) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (isAdmin && isDashboard) {
    return <AdminDashboardPage />;
  }

  if (isAdmin && isTeam) {
    return <AdminTeamPage />;
  }

  if (isEditor && isDashboard) {
    return <EditorDashboardPage />;
  }

  if (isComplaints) {
    return <ComplaintsPage />;
  }

  if (isSettings) {
    return <SettingsPage />;
  }

  if (isEventDetail) {
    return <EventDetailPage />;
  }

  if (isEventsList) {
    return <EventsPage />;
  }

  return <Navigate to={getDefaultAppRoute(role)} replace />;
}
