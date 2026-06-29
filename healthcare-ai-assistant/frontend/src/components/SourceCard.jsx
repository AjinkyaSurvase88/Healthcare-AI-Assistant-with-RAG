import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  // ChromaDB returns lower score for more similarity if L2. 
  // Let's just display it formatted.
  const displayScore = (source.similarity_score).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm my-2 text-sm">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <FileText size={16} className="text-blue-500" />
          <span className="truncate max-w-[200px]">{source.document_name}</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            Chunk {source.chunk_number}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Score: {displayScore}</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 text-slate-600 bg-slate-50 p-2 rounded text-xs leading-relaxed max-h-40 overflow-y-auto">
              {source.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
