import { useLocation, useParams, Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { getDefaultAppRoute } from '../../lib/appRoutes';
import EventsPage from './EventsPage';
import EventDetailPage from './EventDetailPage';
import AdminDashboardPage from './AdminDashboardPage';
import EditorDashboardPage from './EditorDashboardPage';
import ComplaintsPage from './ComplaintsPage';
import AdminTeamPage from './AdminTeamPage';
import ComingSoonPage from './ComingSoonPage';

export default function MediaFlowRouter() {
  const { isEditor, isAdmin, isPhotographer, role } = useRole();
  const { pathname } = useLocation();
  const { eventId } = useParams();

  const isDashboard = pathname.endsWith('/dashboard');
  const isEventsList = !eventId && pathname.endsWith('/events');
  const isEventDetail = Boolean(eventId);
  const isComplaints = pathname.endsWith('/complaints');
  const isTeam = pathname.endsWith('/team');

  if (isTeam && !isAdmin) {
    return <Navigate to={getDefaultAppRoute(role)} replace />;
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

  if (isEventDetail) {
    return <EventDetailPage />;
  }

  if (isEventsList) {
    return <EventsPage />;
  }

  if (isPhotographer && isDashboard) {
    return <Navigate to="/app/events" replace />;
  }

  return <ComingSoonPage />;
}
