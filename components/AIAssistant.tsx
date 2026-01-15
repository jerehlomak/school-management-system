
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';
import { getAIAssistance } from '../services/geminiService';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface AIAssistantProps {
  systemInstruction?: string; // Optional custom instruction for the AI
}

const AIAssistant: React.FC<AIAssistantProps> = ({ systemInstruction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await getAIAssistance(input, systemInstruction);
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI assistance:', error);
      const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I am unable to respond at the moment. Please try again later.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, systemInstruction]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col h-[500px] max-h-[calc(100vh-200px)]">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">AI Assistant</h3>
      <div className="flex-1 overflow-y-auto space-y-3 p-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Ask me anything about school policies, assignments, or general knowledge!
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none animate-pulse">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
          aria-label="AI assistant input"
        />
        <Button type="submit" loading={loading}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default AIAssistant;
