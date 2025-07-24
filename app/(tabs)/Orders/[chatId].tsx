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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/supabaseClient';

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

type Profile = {
  first_name: string;
  image_url: string | null;
};

export default function ChatPage() {
  const { chatId, receiverId, otherUserName, otherUserAvatar } = useLocalSearchParams<{
    chatId: string;
    receiverId: string;
    otherUserName: string;
    otherUserAvatar: string;
  }>();

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
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
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
        receiver_id: receiverId, // ✅ Include receiver_id here
        message: input.trim(),
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

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
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
        <Text style={styles.headerName}>
          {otherUserName ?? 'user'}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    marginRight: 12,
  },
  headerName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 12,
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
  timestamp: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
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
