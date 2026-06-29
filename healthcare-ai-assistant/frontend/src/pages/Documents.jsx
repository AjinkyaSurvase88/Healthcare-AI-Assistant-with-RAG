import { useState, useEffect } from 'react';
import { UploadCloud, File, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument } from '../services/api';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch documents.");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = null; // reset input
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      setError("Failed to delete document.");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Document Management</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Upload Document</h3>
            <label className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-slate-50 hover:border-blue-500 transition h-48">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-sm text-slate-500">Ingesting and generating embeddings...</span>
                </div>
              ) : (
                <>
                  <UploadCloud size={40} className="text-blue-500 mb-3" />
                  <span className="text-sm text-slate-600 font-medium text-center">Click to browse or drag file</span>
                  <span className="text-xs text-slate-400 mt-1">PDF, TXT, DOCX</span>
                  <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={handleFileUpload} disabled={isUploading} />
                </>
              )}
            </label>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full min-h-[300px]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 flex justify-between items-center">
              Uploaded Documents
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {documents.length} files
              </span>
            </h3>
            
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <File size={40} className="mb-2 opacity-50" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded shadow-sm text-blue-500 shrink-0">
                        <File size={20} />
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-slate-700 truncate">{doc.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle size={12} className="text-green-500" />
                          <span className="text-xs text-slate-500">Embedded</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition shrink-0"
                      title="Delete Document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
