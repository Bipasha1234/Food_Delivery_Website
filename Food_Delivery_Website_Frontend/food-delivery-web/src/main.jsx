import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { NotificationProvider } from '../src/context/notificationContext.jsx';
import { ProfileProvider } from '../src/context/profileContext.jsx';
import { BasketProvider } from './context/basketContext.jsx';

createRoot(document.getElementById('root')).render(
  <NotificationProvider>
    <ProfileProvider>       
      <BasketProvider>
        <App />
      </BasketProvider>
    </ProfileProvider>
  </NotificationProvider>
);
