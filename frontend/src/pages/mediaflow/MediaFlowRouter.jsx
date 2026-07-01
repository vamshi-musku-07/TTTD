import { useLocation, useParams } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import EventsPage from './EventsPage';
import EventDetailPage from './EventDetailPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminEventsPage from './AdminEventsPage';
import EditorDashboardPage from './EditorDashboardPage';
import ComplaintsPage from './ComplaintsPage';
import CameramanEventsPage from './CameramanEventsPage';
import ComingSoonPage from './ComingSoonPage';

export default function MediaFlowRouter() {
  const { isEditor, isAdmin, isPhotographer } = useRole();
  const { pathname } = useLocation();
  const { eventId } = useParams();

  const isDashboard = pathname.endsWith('/dashboard');
  const isEventsList = !eventId && pathname.endsWith('/events');
  const isEventDetail = Boolean(eventId);
  const isComplaints = pathname.endsWith('/complaints');

  if (isAdmin && isDashboard) {
    return <AdminDashboardPage />;
  }

  if (isAdmin && isEventsList) {
    return <AdminEventsPage />;
  }

  if (isEditor && isDashboard) {
    return <EditorDashboardPage />;
  }

  if (isEditor && isComplaints) {
    return <ComplaintsPage />;
  }

  if (isEditor && isEventDetail) {
    return <EventDetailPage />;
  }

  if (isEditor && isEventsList) {
    return <EventsPage />;
  }

  if (isPhotographer && isEventsList) {
    return <CameramanEventsPage />;
  }

  return <ComingSoonPage />;
}
