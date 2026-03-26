import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Leaf, ChevronRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG/PNG).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
  };

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Is the backend running?');
      console.error(err);
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
    <div className="container">
      <header>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="brand"
        >
          <Leaf className="leaf-icon" />
          <h1>GrowGuard</h1>
        </motion.div>
        <p className="subtitle">Instant Plant Disease Detection via Deep Learning</p>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {!prediction ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card upload-card"
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {previewUrl ? (
                <div className="preview-container">
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                  <div className="preview-actions">
                    <button onClick={reset} className="btn-secondary">Change Image</button>
                    <button 
                      onClick={handlePredict} 
                      className="btn-primary" 
                      disabled={loading}
                    >
                      {loading ? <RefreshCw className="spin" /> : 'Analyze Leaf'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dropzone" onClick={() => fileInputRef.current.click()}>
                  <div className="upload-icon-wrapper">
                    <Upload size={40} />
                  </div>
                  <h3>Upload Potato Leaf</h3>
                  <p>Drag & drop or click to browse</p>
                  <span className="file-hint">Supports JPG, PNG, WebP</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="results-grid"
            >
              <div className="card result-card">
                <div className="result-header">
                  {prediction.is_healthy ? (
                    <CheckCircle2 color="#10b981" size={32} />
                  ) : (
                    <AlertCircle color="#f59e0b" size={32} />
                  )}
                  <div>
                    <h2>{prediction.predicted_class.replace(/___/g, ' ')}</h2>
                    <p className="confidence">{prediction.confidence}% Confidence</p>
                  </div>
                </div>

                <div className="prob-list">
                  {prediction.all_predictions.map((p) => (
                    <div key={p.label} className="prob-item">
                      <div className="prob-info">
                        <span>{p.label.replace(/___/g, ' ')}</span>
                        <span>{p.confidence}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div 
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${p.confidence}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={reset} className="btn-outline">
                  <RefreshCw size={18} /> Run Another Check
                </button>
              </div>

              <div className="card info-card">
                <h3>Agricultural Advice</h3>
                <p className="message-text">{prediction.message}</p>
                <div className="tips">
                  <div className="tip">
                    <ChevronRight size={16} />
                    <span>Always use clean tools for pruning.</span>
                  </div>
                  <div className="tip">
                    <ChevronRight size={16} />
                    <span>Check soil moisture regularly.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-toast"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 GrowGuard AI • Powered by TensorFlow Serving</p>
      </footer>
    </div>
  );
}

export default App;
