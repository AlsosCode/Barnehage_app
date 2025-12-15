import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

import api, { Message, Parent } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Palette } from '@/constants/theme';

type ConversationMessage = Message & { parentName?: string };

export default function MessagesScreen() {
  const { userRole, parentId } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const isGuest = userRole === 'guest';
  const canSend = content.trim().length > 0;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isGuest) {
          if (parentId == null) {
            setMessages([]);
            return;
          }
          const msgs = await api.messages.listForParent(parentId);
          setMessages(
            msgs.map((m) => ({
              ...m,
            })),
          );
        } else {
          const [allParents, initialMessages] = await Promise.all([
            api.parents.getAll(),
            api.messages.listAll(),
          ]);
          setParents(allParents);
          setMessages(
            initialMessages.map((m) => ({
              ...m,
              parentName: allParents.find((p) => p.id === m.parentId)?.name,
            })),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isGuest, parentId]);

  const filteredMessages = useMemo(() => {
    if (isGuest) return messages;
    if (!selectedParentId) return messages;
    return messages.filter((m) => m.parentId === selectedParentId);
  }, [isGuest, messages, selectedParentId]);

  const handleSend = async () => {
    if (!canSend) return;
    try {
      setSending(true);
      const targetParentId =
        isGuest && parentId != null
          ? parentId
          : selectedParentId ?? parents[0]?.id;

      if (!targetParentId) {
        return;
      }

      const msg = await api.messages.send({
        parentId: targetParentId,
        sender: isGuest ? 'parent' : 'staff',
        content: content.trim(),
      });

      const parentName =
        parents.find((p) => p.id === msg.parentId)?.name ?? undefined;

      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          parentName,
        },
      ]);
      setContent('');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => {
    const isOwn =
      (isGuest && item.sender === 'parent') ||
      (!isGuest && item.sender === 'staff');

    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? styles.messageRowOwn : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          {!isGuest && (
            <Text style={styles.metaText}>
              {item.sender === 'parent' ? item.parentName || `Forelder #${item.parentId}` : 'Ansatt'}
            </Text>
          )}
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString('nb-NO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.centeredText}>Laster meldinger...</Text>
      </View>
    );
  }

  const parentSelector =
    !isGuest && parents.length > 0 ? (
      <View style={styles.parentRow}>
        {parents.map((p) => {
          const active =
            (selectedParentId ?? parents[0]?.id) === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.parentChip,
                active && styles.parentChipActive,
              ]}
              onPress={() => setSelectedParentId(p.id)}
            >
              <Text
                style={[
                  styles.parentChipText,
                  active && styles.parentChipTextActive,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {parentSelector}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredMessages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Skriv en melding..."
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!canSend || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!canSend || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centeredText: {
    marginTop: 8,
    color: Palette.textMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: Palette.primary,
  },
  bubbleOther: {
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    color: '#111827',
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Palette.primary,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  parentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  parentChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
  },
  parentChipActive: {
    borderColor: Palette.primary,
    backgroundColor: '#EFF6FF',
  },
  parentChipText: {
    fontSize: 12,
    color: Palette.text,
  },
  parentChipTextActive: {
    fontWeight: '700',
  },
});

