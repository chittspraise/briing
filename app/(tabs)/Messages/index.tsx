import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

type Conversation = {
  id: string; // chat_id
  other_user_id: string;
  name: string; // other user's first_name
  avatar: string; // other user's avatar
  last_message: string;
  updated_at: string;
  unread_count: number;
};

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_conversations', { user_id_param: user.id });

      if (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };

    fetchConversations();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchConversations)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() =>
        router.push({
          pathname: '/Orders/[chatId]',
          params: {
            chatId: item.id,
            receiverId: item.other_user_id,
            otherUserName: item.name,
            otherUserAvatar: item.avatar,
          },
        })
      }
    >
      <Image
        source={{
          uri: item.avatar || `https://picsum.photos/seed/${item.other_user_id}/50`,
        }}
        style={styles.avatar}
      />
      <View style={styles.textContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          {item.last_message ?? 'No messages yet.'}
        </Text>
      </View>
      <View style={styles.metaContent}>
        <Text style={styles.time}>
          {new Date(item.updated_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No conversations found.
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: { fontSize: 28, fontWeight: 'bold', marginLeft: 16, marginBottom: 16, color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  list: { paddingHorizontal: 16 },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContent: { flex: 1, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#fff' },
  messagePreview: { fontSize: 14, color: '#ccc', marginTop: 4 },
  metaContent: { alignItems: 'flex-end' },
  time: { fontSize: 12, color: '#888', marginBottom: 4 },
  unreadBadge: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});

export default MessagesPage;
