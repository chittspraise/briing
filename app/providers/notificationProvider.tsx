import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from 'react';
import * as Notifications from 'expo-notifications';
import registerForPushNotificationsAsync from '../lib/notification';
import { supabase } from '../../supabaseClient';

type NotificationContextType = {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  notificationCount: number;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const saveUserPushNotificationToken = async (token: string) => {
    if (!token.length) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    await supabase
      .from('profiles')
      .update({
        expo_notification_token: token,
      })
      .eq('id', session.user.id);
  };

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        setExpoPushToken(token ?? '');
        saveUserPushNotificationToken(token ?? '');
      })
      .catch((error: any) => console.error(error));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    const fetchUnreadCount = async () => {
      console.log('Attempting to fetch unread notification count...');
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user found, aborting fetch.');
        return;
      }
      console.log(`Fetching count for user: ${user.id}`);

      const { data, error } = await supabase.rpc(
        'get_total_unread_count',
        { user_id_param: user.id }
      );

      if (error) {
        console.error('Error fetching notification count:', error);
        return;
      }

      console.log(`Successfully fetched count: ${data}`);
      setNotificationCount(data);
    };

    fetchUnreadCount();

    const notificationsChannel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        fetchUnreadCount
      )
      .subscribe();

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  console.log('expoPushToken', expoPushToken);
  console.log('notification', notification);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        notificationCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

export default NotificationProvider;

