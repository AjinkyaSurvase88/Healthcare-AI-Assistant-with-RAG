import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import SourceCard from './SourceCard';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getConfidenceBadge = (confidence, isAppointment) => {
    if (isAppointment) {
      return (
        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full mt-2 w-fit">
          <CheckCircle2 size={12} /> Appointment Agent
        </div>
      );
    }
    
    if (confidence === 'High') {
      return (
        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full mt-2 w-fit">
          <ShieldCheck size={12} /> High Confidence
        </div>
      );
    }
    if (confidence === 'Medium') {
      return (
        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full mt-2 w-fit">
          <ShieldCheck size={12} /> Medium Confidence
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full mt-2 w-fit">
        <ShieldAlert size={12} /> Low Confidence
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 relative">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Bot size={48} className="mb-4 text-blue-300 opacity-50" />
          <p>How can I help you today?</p>
        </div>
      )}
      
      {messages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "flex max-w-4xl mx-auto gap-4",
            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
            msg.role === 'user' ? "bg-blue-600 text-white" : "bg-emerald-500 text-white"
          )}>
            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
          </div>
          
          <div className={clsx(
            "flex flex-col gap-2 max-w-[80%]",
            msg.role === 'user' ? "items-end" : "items-start"
          )}>
            <div className={clsx(
              "px-4 py-3 rounded-2xl shadow-sm text-[0.95rem]",
              msg.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-sm" 
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
            )}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
            
            {msg.role === 'assistant' && msg.confidence && getConfidenceBadge(msg.confidence, msg.isAppointment)}
            
            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
              <div className="w-full mt-2">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Sources</p>
                <div className="flex flex-col gap-2">
                  {msg.sources.map((source, i) => (
                    <SourceCard key={i} source={source} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {isLoading && (
        <div className="flex max-w-4xl mx-auto gap-4 flex-row">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-emerald-500 text-white">
             <Bot size={18} />
          </div>
          <div className="px-4 py-4 rounded-2xl shadow-sm bg-white border border-slate-200 rounded-tl-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
