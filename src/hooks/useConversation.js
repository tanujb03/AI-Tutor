import { useState } from 'react';
import initialConversation from '../data/conversation.json';

export function useConversation() {
  const [conversation, setConversation] = useState(initialConversation);

  const addMessage = (newMessage) => {
    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  return { conversation, addMessage };
}
