import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
};

export default function ChatPage() {
  const { chatId, receiverId, otherUserName, otherUserAvatar, rating, productName, productImage } = useLocalSearchParams<{
    chatId: string;
    receiverId: string;
    otherUserName: string;
    otherUserAvatar: string;
    rating: string;
    productName: string;
    productImage: string;
  }>();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error('Failed to fetch user', error);
        return;
      }
      setCurrentUserId(data.user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const markAsRead = async () => {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_chat_id: chatId,
        p_user_id: currentUserId,
      });
      if (error) {
        console.error('Failed to mark messages as read:', error);
      }
    };

    markAsRead();
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch messages error:', error);
        return;
      }
      setMessages(data || []);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.old.id ? (payload.new as Message) : msg
              )
            );
          }
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId || !currentUserId || !receiverId) return;

    const { error } = await supabase.from('messages').insert([
      {
        chat_id: chatId,
        sender_id: currentUserId,
        receiver_id: receiverId,
        message: input.trim(),
        status: 'sent',
      },
    ]);

    if (error) {
      console.error('Send message error:', error);
    } else {
      setInput('');
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === currentUserId;

    const getStatusIcon = () => {
      if (item.status === 'read') {
        return <Ionicons name="checkmark-done" size={16} color="#34B7F1" />;
      }
      if (item.status === 'delivered') {
        return <Ionicons name="checkmark-done" size={16} color="#ccc" />;
      }
      return <Ionicons name="checkmark" size={16} color="#ccc" />;
    };

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <View style={styles.messageInfo}>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isOwn && getStatusIcon()}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{
              uri:
                otherUserAvatar?.trim()
                  ? otherUserAvatar
                  : `https://placehold.co/40x40/000000/FFFFFF?text=${otherUserName
                      ?.slice(0, 2)
                      .toUpperCase() ?? '??'}`,
            }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerName}>
              {otherUserName ?? 'user'}
            </Text>
            <View style={styles.headerStats}>
              {rating ? (
                <Text style={styles.statText}>
                  ⭐ {parseFloat(rating).toFixed(1)}
                </Text>
              ) : <Text style={styles.statText}>⭐ N/A</Text>}
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          ListHeaderComponent={
            productName ? (
              <TouchableOpacity onPress={() => router.push('/(tabs)/Orders/my_orders')}>
                <View style={styles.productInfoContainer}>
                  {productImage && (
                    <Image
                      source={{ uri: productImage }}
                      style={styles.productImage}
                    />
                  )}
                  <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
                </View>
              </TouchableOpacity>
            ) : null
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#888"
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    marginRight: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    marginRight: 12,
  },
  headerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statText: {
    color: '#ccc',
    fontSize: 12,
    marginRight: 10,
  },
  productInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
  },
  ownMessage: {
    backgroundColor: '#1e90ff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    color: '#ccc',
    fontSize: 10,
    marginRight: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#222',
    borderTopWidth: 1,
    backgroundColor: '#111',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});