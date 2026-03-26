import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Upload, RefreshCw, Leaf, AlertCircle, CheckCircle2, ChevronRight, History, Trash2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MobileApp.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function MobileApp() {
  const [view, setView] = useState('scan'); // 'scan' or 'history'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('pdd_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (newPrediction) => {
    const historyItem = {
      ...newPrediction,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      imageUrl: previewUrl // Note: in real apps, convert to base64 or storage URL
    };
    const updatedHistory = [historyItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    localStorage.setItem('pdd_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pdd_history');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Invalid image format');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData);
      setPrediction(response.data);
      saveToHistory(response.data);
    } catch (err) {
      setError('Connection failed. Using cached model results if available.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setView('scan');
  };

  return (
    <div className="mobile-app">
      <div className="bg-blur top-right"></div>
      <div className="bg-blur bottom-left"></div>

      <header className="mobile-header">
        <div className="brand">
          <Leaf className="brand-icon" />
          <h1>GrowGuard</h1>
        </div>
        <div className="connectivity-status">
            {navigator.onLine ? <div className="online-dot"></div> : <div className="offline-tag">Offline Mode</div>}
        </div>
      </header>

      <main className="mobile-content">
        <AnimatePresence mode="wait">
          {view === 'scan' ? (
            <motion.div 
              key="scan-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="view-container"
            >
              {!prediction ? (
                <div className="scanner-container">
                  {previewUrl ? (
                    <div className="preview-frame">
                      <img src={previewUrl} alt="Leaf preview" />
                      <div className="scan-line"></div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="scanner-target"><Camera size={48} /></div>
                      <h2>Scan Your Plant</h2>
                      <p>Use the camera to detect diseases in real-time.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="results-view">
                  <div className="result-main-card">
                    <div className={`status-badge ${prediction.is_healthy ? 'healthy' : 'warning'}`}>
                      {prediction.predicted_class.replace(/___/g, ' ')}
                    </div>
                    <div className="confidence-meter">
                        <div className="meter-label">Confidence <span>{prediction.confidence}%</span></div>
                        <div className="meter-bar"><div className="meter-fill" style={{width: `${prediction.confidence}%`}}></div></div>
                    </div>
                    <div className="treatment-card">
                      <h3>Advice</h3>
                      <p>{prediction.message}</p>
                    </div>
                    <button className="btn-full-width" onClick={reset}>Scan Another</button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="view-container history-view"
            >
              <div className="history-header">
                <h2>Recent Diagnoses</h2>
                {history.length > 0 && (
                  <button className="clear-btn" onClick={clearHistory}>
                    <Trash2 size={16} /> Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="empty-history">
                  <History size={48} className="muted-icon" />
                  <p>Your diagnosis history will appear here.</p>
                </div>
              ) : (
                <div className="history-list">
                  {history.map(item => (
                    <div key={item.id} className="history-item">
                      <div className={`history-dot ${item.is_healthy ? 'healthy' : 'warning'}`}></div>
                      <div className="history-info">
                        <strong>{item.predicted_class.replace(/___/g, ' ')}</strong>
                        <span>{item.timestamp}</span>
                      </div>
                      <div className="history-conf">{item.confidence}%</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mobile-nav">
        <button 
          className={`nav-item ${view === 'scan' ? 'active' : ''}`} 
          onClick={reset}
        >
          <Home size={24} />
          <span>Home</span>
        </button>
        
        <div className="actions-center">
            {!prediction && view === 'scan' && (
                <button 
                className={`main-action-btn ${loading ? 'loading' : ''}`}
                onClick={previewUrl ? handlePredict : () => cameraInputRef.current.click()}
                >
                {loading ? <RefreshCw className="spin" /> : previewUrl ? 'Analyze' : <Camera />}
                </button>
            )}
        </div>

        <button 
          className={`nav-item ${view === 'history' ? 'active' : ''}`} 
          onClick={() => setView('history')}
        >
          <History size={24} />
          <span>History</span>
        </button>
      </footer>

      {/* Hidden UI */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
      <input type="file" ref={cameraInputRef} onChange={handleFileChange} hidden accept="image/*" capture="environment" />
      {error && <div className="error-popup">{error}</div>}
    </div>
  );
}
