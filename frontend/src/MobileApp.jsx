import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, Upload, RefreshCw, Leaf, AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MobileApp.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function MobileApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
    } catch (err) {
      setError('Connection failed. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="mobile-app">
      {/* Background Decor */}
      <div className="bg-blur top-right"></div>
      <div className="bg-blur bottom-left"></div>

      {/* Header */}
      <header className="mobile-header">
        <div className="brand">
          <Leaf className="brand-icon" />
          <h1>PDD Mobile</h1>
        </div>
        <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>
          <Info size={20} />
        </button>
      </header>

      <main className="mobile-content">
        <AnimatePresence mode="wait">
          {!prediction ? (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="scanner-container"
            >
              {previewUrl ? (
                <div className="preview-frame">
                  <img src={previewUrl} alt="Leaf preview" />
                  <div className="scan-line"></div>
                  <div className="corner tr"></div>
                  <div className="corner tl"></div>
                  <div className="corner br"></div>
                  <div className="corner bl"></div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="scanner-target">
                    <Camera size={48} className="placeholder-icon" />
                  </div>
                  <h2>Ready to Scan</h2>
                  <p>Point your camera at the potato leaf or upload a photo.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="results-view"
            >
              <div className="result-main-card">
                <div className={`status-badge ${prediction.is_healthy ? 'healthy' : 'warning'}`}>
                  {prediction.is_healthy ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {prediction.predicted_class.replace(/___/g, ' ')}
                </div>
                
                <div className="confidence-meter">
                  <div className="meter-label">
                    <span>Diagnosis Confidence</span>
                    <span className="percentage">{prediction.confidence}%</span>
                  </div>
                  <div className="meter-bar">
                    <motion.div 
                      className="meter-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="treatment-card">
                  <h3>Action Plan</h3>
                  <p>{prediction.message}</p>
                </div>
              </div>

              <div className="breakdown-list">
                <h4>Probabilities</h4>
                {prediction.all_predictions.map(p => (
                  <div key={p.label} className="breakdown-item">
                    <span>{p.label.replace(/___/g, ' ')}</span>
                    <div className="small-bar">
                        <div className="small-fill" style={{width: `${p.confidence}%`}}></div>
                    </div>
                    <span className="small-conf">{p.confidence}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Tray */}
      <footer className="action-tray">
        {!prediction ? (
          <div className="tray-controls">
            <button className="tray-btn secondary" onClick={() => fileInputRef.current.click()}>
              <Upload size={24} />
              <span>Library</span>
            </button>

            <button 
              className={`tray-btn primary ${loading ? 'loading' : ''}`}
              onClick={previewUrl ? handlePredict : () => cameraInputRef.current.click()}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="spin" size={32} />
              ) : previewUrl ? (
                <div className="analyze-now">Analyze</div>
              ) : (
                <Camera size={32} />
              )}
            </button>

            <button className="tray-btn secondary" onClick={reset} disabled={!previewUrl}>
              <RefreshCw size={24} />
              <span>Reset</span>
            </button>
          </div>
        ) : (
          <div className="tray-controls single">
            <button className="tray-btn primary full" onClick={reset}>
               Back to Camera
            </button>
          </div>
        )}
      </footer>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        hidden 
        accept="image/*" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        hidden 
        accept="image/*" 
        capture="environment" 
      />

      {error && <div className="error-popup">{error}</div>}
    </div>
  );
}
