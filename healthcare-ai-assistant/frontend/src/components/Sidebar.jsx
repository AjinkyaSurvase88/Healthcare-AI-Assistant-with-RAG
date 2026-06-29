import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, FileText, Settings, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [health, setHealth] = useState({ llm: false, db: false });

  useEffect(() => {
    checkHealth().then(res => {
      setHealth({ llm: res.llm_available, db: res.chroma_available });
    }).catch(() => {
      setHealth({ llm: false, db: false });
    });
  }, []);

  const navItems = [
    { name: 'Chat', path: '/', icon: MessageSquare },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <Activity className="text-blue-500" />
          HealthAI
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-sm">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span>Gemma 3</span>
          <span className={clsx("w-2 h-2 rounded-full", health.llm ? "bg-green-500" : "bg-red-500")} title="LLM Status"></span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>ChromaDB</span>
          <span className={clsx("w-2 h-2 rounded-full", health.db ? "bg-green-500" : "bg-red-500")} title="Vector DB Status"></span>
        </div>
      </div>
    </div>
  );
}
