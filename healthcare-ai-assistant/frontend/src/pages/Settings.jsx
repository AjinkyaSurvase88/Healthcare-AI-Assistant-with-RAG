import { useState } from 'react';
import { Save, Server, Cpu, Database } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    model: 'gemma3',
    temperature: 0.1,
    topK: 4,
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would hit a PUT /settings endpoint
    alert("Settings saved! (Note: In this version, settings are mostly controlled via .env on the backend)");
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Configuration</h2>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <Cpu size={20} className="text-blue-500" />
              LLM Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model Selection</label>
                <select 
                  name="model"
                  value={settings.model}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none bg-slate-50"
                >
                  <option value="gemma3">Gemma 3 (Local via Ollama)</option>
                  <option value="llama3">Llama 3</option>
                  <option value="mistral">Mistral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temperature ({settings.temperature})</label>
                <input 
                  type="range" 
                  name="temperature"
                  min="0" max="1" step="0.1"
                  value={settings.temperature}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <Database size={20} className="text-blue-500" />
              RAG Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Top K Results</label>
                <input 
                  type="number" 
                  name="topK"
                  min="1" max="10"
                  value={settings.topK}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chunk Size</label>
                <input 
                  type="number" 
                  name="chunkSize"
                  step="100"
                  value={settings.chunkSize}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chunk Overlap</label>
                <input 
                  type="number" 
                  name="chunkOverlap"
                  step="50"
                  value={settings.chunkOverlap}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <Server size={20} className="text-blue-500" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Ollama Endpoint</span>
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">http://localhost:11434</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">FastAPI Backend</span>
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">http://localhost:8000</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Embedding Model</span>
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">all-MiniLM-L6-v2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
