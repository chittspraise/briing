import React, {
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { supabase } from '../../supabaseClient';

type MessageContextType = {
  unreadCount: number;
};

const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);

const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchTotalUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_total_unread_count', {
        user_id_param: user.id,
      });
      if (!error) {
        setUnreadCount(data);
      }
    };

    fetchTotalUnreadCount();

    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        fetchTotalUnreadCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  return (
    <MessageContext.Provider
      value={{
        unreadCount,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export default MessageProvider;
