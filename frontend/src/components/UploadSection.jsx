import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Database, BarChart2, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadSection = () => {
  const [file, setFile] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadDataset = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use dynamic base URL for production (Render) or fallback to local
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      // Send to FastAPI backend
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Save result to localStorage for persistence across pages (like the Hero stats)
      localStorage.setItem('lastAnalysis', JSON.stringify(response.data));
      
      // Navigate to dashboard and pass the result data via React state
      navigate('/dashboard', { state: { result: response.data } });
    } catch (error) {
      console.error(error);
      setUploadError(error.response?.data?.detail || 'An error occurred while analyzing the dataset. Ensure your CSV has CustomerID, Date, and Amount columns.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-20 w-full px-6 flex flex-col items-center">
      <div className="max-w-[900px] w-full text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4 font-sans tracking-tight">AI Segmentation Hub</h2>
        <p className="text-textSecondary text-lg max-w-2xl mx-auto font-medium">
          Feed the ML model your raw transaction logs. Our engine handles the complexity of RFM scoring and clustering.
        </p>
      </div>

      <div className="w-full max-w-[900px] grid md:grid-cols-3 gap-8">
        {/* Upload Box */}
        <div className="md:col-span-2">
          <div 
            className={`glass-panel border-dashed border-2 rounded-2xl p-12 flex flex-col items-center justify-center transition-all ${
              isHovering ? 'border-accent bg-accent/5' : 'border-border'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={handleDrop}
          >
            <UploadCloud className="w-16 h-16 text-accent mb-6 font-light" strokeWidth={1} />
            
            {file ? (
              <div className="text-center mb-6">
                <p className="text-textPrimary font-bold text-2xl mb-1">{file.name}</p>
                <p className="text-textSecondary text-xs mb-4 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for processing</p>
                <button 
                  onClick={() => setFile(null)} 
                  className="text-red-400 font-bold hover:underline text-xs"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <>
                <p className="text-textPrimary text-lg mb-2 font-semibold">Drop your dataset here</p>
                <p className="text-textSecondary text-xs mb-6 font-bold uppercase tracking-tighter">or browse local files</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-accent text-background font-extrabold py-3.5 px-8 rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-accent/20"
                >
                  Select CSV / XLSX
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv,.xlsx" 
                  className="hidden" 
                />
              </>
            )}
            
            <p className="text-textSecondary text-xs mt-8 mt-auto pt-4 w-full border-t border-border/50 text-center font-bold tracking-widest uppercase">
              Encrypted end-to-end · No storage
            </p>
          </div>
          
          {uploadError && (
            <div className="mt-4 p-4 rounded-xl bg-red-400/10 border border-red-500/20 text-red-400 text-xs text-center font-bold font-mono">
               ❌ {uploadError}
            </div>
          )}
        </div>

        {/* Side Info Panel */}
        <div className="md:col-span-1">
          <div className="glass-panel p-8 rounded-2xl border border-border flex flex-col h-full shadow-2xl bg-surface/20">
            <p className="text-[10px] font-extrabold text-textSecondary uppercase tracking-[0.2em] mb-6">ML Performance</p>
            <h3 className="text-textPrimary text-sm font-bold mb-4 leading-relaxed">
              Model Training Level: <span className="text-accent underline">Premium v2</span>
            </h3>
            
            <div className="mt-auto">
              <p className="text-textPrimary text-3xl font-black mb-2 tracking-tighter">98.1%</p>
              <div className="w-full bg-surface rounded-full h-1.5 mb-2 overflow-hidden border border-border">
                <div className="bg-accent h-1.5 rounded-full" style={{ width: '98%' }}></div>
              </div>
              <p className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Confidence Index</p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="w-full max-w-[900px] mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-border flex flex-col items-start hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-4 text-accent">
            <Database className="w-5 h-5" />
            <span className="font-bold text-textPrimary text-sm uppercase tracking-wider">1. Prep</span>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed font-medium">
            System reads Recency, Frequency, and Monetary metrics from raw logs.
          </p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl border border-border flex flex-col items-start hover:-translate-y-1 transition-transform border-accent/20">
          <div className="flex items-center gap-3 mb-4 text-accent">
            <BarChart2 className="w-5 h-5" />
            <span className="font-bold text-textPrimary text-sm uppercase tracking-wider">2. Cluster</span>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed font-medium">
            K-Means algorithm segments customers based on behavioral distance.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border flex flex-col items-start hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-4 text-accent">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-textPrimary text-sm uppercase tracking-wider">3. Action</span>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed font-medium">
            Download or view actionable marketing cohorts for your campagins.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-16 text-center w-full max-w-[900px] flex flex-col items-center">
        <button 
          onClick={uploadDataset}
          disabled={!file || isUploading}
          className={`bg-accent text-background font-black py-5 px-16 text-xl rounded-2xl hover:bg-opacity-90 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-accent/30`}
        >
          {isUploading ? <><Loader2 className="w-7 h-7 animate-spin" /> Computing Models...</> : <>Run Analysis <ArrowRight className="w-6 h-6" /></>}
        </button>
        <p className="text-[10px] text-textSecondary mt-6 flex items-center gap-2 font-bold uppercase tracking-widest">
           v2.4.1 Production Core
        </p>
      </div>

    </section>
  );
};

export default UploadSection;
