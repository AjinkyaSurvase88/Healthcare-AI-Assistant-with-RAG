import { useState } from 'react';
import { Send, Trash2, Mic } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { askQuestion } from '../services/api';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    try {
      const res = await askQuestion(userMsg.content);
      const assistantMsg = {
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        isAppointment: res.is_appointment
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please ensure the backend is running.',
        confidence: 'Low'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="h-16 border-b border-slate-200 bg-white flex justify-between items-center px-6 shadow-sm z-10 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">Healthcare Assistant</h2>
        <button 
          onClick={clearChat}
          className="text-slate-500 hover:text-red-500 transition flex items-center gap-2 text-sm"
          title="Clear Conversation"
        >
          <Trash2 size={16} />
          Clear
        </button>
      </header>
      
      <ChatWindow messages={messages} isLoading={isLoading} />
      
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a medical question or ask to book an appointment..."
            className="w-full resize-none rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 pl-4 pr-24 max-h-32 min-h-[56px] shadow-sm bg-slate-50 text-slate-800"
            rows="1"
          />
          <div className="absolute right-2 bottom-2.5 flex items-center gap-2">
            <button 
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition"
              title="Voice Input (Mock)"
            >
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400">AI-generated responses. Do not use for medical diagnosis.</p>
        </div>
      </div>
    </div>
  );
}
