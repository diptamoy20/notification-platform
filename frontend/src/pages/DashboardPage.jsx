import { NotificationPanel } from '../../../packages/notification-widget';
import { createRestAdapter } from '../../../packages/notification-widget/adapters/restAdapter';

// Use the Vite proxy base URL
const adapter = createRestAdapter({ baseUrl: '/api/v1' });

const DashboardPage = () => {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <NotificationPanel adapter={adapter} />
    </div>
  );
};

export default DashboardPage;
