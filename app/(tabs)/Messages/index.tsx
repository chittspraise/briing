import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';

type Conversation = {
  id: string; // chat_id
  name: string; // sender first_name of latest message
  last_message: string;
  updated_at: string;
};

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      setLoading(false);
      return;
    }

    const userId = user.id;

    try {
      // Step 1: Get all unique chat_ids where user is sender or receiver
      const { data: chatIdsData, error: chatIdsError } = await supabase
        .from('messages')
        .select('chat_id', { count: 'exact', head: false })
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .limit(1000); // increase if needed

      if (chatIdsError) {
        throw chatIdsError;
      }

      if (!chatIdsData || chatIdsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Extract unique chat_ids
      const uniqueChatIds = Array.from(
        new Set(chatIdsData.map((m) => m.chat_id))
      );

      // Step 2: For each chat_id fetch latest message + sender profile
      const promises = uniqueChatIds.map(async (chatId) => {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            chat_id,
            message,
            created_at,
            sender_id,
            profiles!sender_id (
              first_name
            )
          `)
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching latest message for chat:', chatId, error);
          return null;
        }

        if (!data) return null;

        type Profile = { first_name: string };
        const profiles = data.profiles as Profile | Profile[] | null | undefined;
        let name = 'Unknown';
        if (Array.isArray(profiles)) {
          name = profiles[0]?.first_name ?? 'Unknown';
        } else if (profiles && typeof profiles === 'object') {
          name = profiles.first_name ?? 'Unknown';
        }
        return {
          id: data.chat_id,
          last_message: data.message,
          updated_at: data.created_at,
          name,
        } as Conversation;
      });

      const results = await Promise.all(promises);

      const filteredResults = results.filter((r) => r !== null) as Conversation[];

      // Step 3: Sort descending by updated_at
      filteredResults.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setConversations(filteredResults);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }

    setLoading(false);
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() =>
        router.push({ pathname: '/Orders/[chatId]', params: { chatId: item.id } })
      }
    >
      <View style={styles.textContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          {item.last_message ?? 'No messages yet.'}
        </Text>
      </View>
      <Text style={styles.time}>
        {new Date(item.updated_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchConversations}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
              No conversations found.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: { fontSize: 24, fontWeight: '700', marginLeft: 16, marginBottom: 16, color: '#fff' },
  list: { paddingHorizontal: 16 },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  textContent: { flex: 1, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#fff' },
  messagePreview: { fontSize: 14, color: '#ccc', marginTop: 2 },
  time: { fontSize: 12, color: '#888', minWidth: 60, textAlign: 'right' },
});

export default MessagesPage;
