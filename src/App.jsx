import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Fingerprint, Activity, Clock, Zap, GitCommit } from 'lucide-react';
import { algorithms } from './utils/hashAlgorithms';
import HashVisualizer from './components/HashVisualizer';

const hexToBin = (hex) => {
  return hex.split('').map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join('');
};

const calcHammingDistance = (hex1, hex2) => {
  if (!hex1 || !hex2) return { distance: 0, percent: 0 };
  const bin1 = hexToBin(hex1);
  const bin2 = hexToBin(hex2);
  
  // Pad the shorter one if lengths differ (though for same algo they should be equal)
  const maxLen = Math.max(bin1.length, bin2.length);
  const pBin1 = bin1.padStart(maxLen, '0');
  const pBin2 = bin2.padStart(maxLen, '0');

  let distance = 0;
  for (let i = 0; i < maxLen; i++) {
    if (pBin1[i] !== pBin2[i]) distance++;
  }
  
  return {
    distance,
    percent: maxLen === 0 ? 0 : (distance / maxLen) * 100
  };
};

export default function App() {
  const [input1, setInput1] = useState('Hello World');
  const [input2, setInput2] = useState('Hello world');
  const [selectedAlgoId, setSelectedAlgoId] = useState(algorithms[2].id);
  
  const [benchmarks, setBenchmarks] = useState({});
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const algo = useMemo(() => algorithms.find(a => a.id === selectedAlgoId), [selectedAlgoId]);
  
  const hash1 = useMemo(() => {
    if (!algo || !input1) return '';
    return algo.fn(input1);
  }, [input1, algo]);

  const hash2 = useMemo(() => {
    if (!algo || !input2) return '';
    return algo.fn(input2);
  }, [input2, algo]);

  const diffStats = useMemo(() => calcHammingDistance(hash1, hash2), [hash1, hash2]);

  // Run benchmark for all algos
  const runBenchmarks = () => {
    setIsBenchmarking(true);
    const results = {};
    const iterations = 5000;
    
    // Slight timeout to let UI update before blocking thread
    setTimeout(() => {
      algorithms.forEach(a => {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          a.fn(input1 + i); // slight variation to prevent JS engine optimization
        }
        const end = performance.now();
        results[a.id] = end - start;
      });
      setBenchmarks(results);
      setIsBenchmarking(false);
    }, 50);
  };

  const renderHighlightedHash = (baseHash, compHash) => {
    if (!baseHash || !compHash || baseHash.length !== compHash.length) return baseHash;
    return baseHash.split('').map((char, i) => {
      const isMatch = char === compHash[i];
      return <span key={i} className={isMatch ? 'match-char' : 'diff-char'}>{char}</span>;
    });
  };

  const maxBenchmarkTime = Math.max(...Object.values(benchmarks).length ? Object.values(benchmarks) : [1]);

  return (
    <div className="app-container">
      <header>
        <h1>Hash Visualizer</h1>
        <p>Explore cryptographic and non-cryptographic hashes through geometry.</p>
      </header>

      <div className="glass-panel">
        <h2 className="section-title"><Shield size={20} /> Select Algorithm</h2>
        <div className="algo-selector">
          {algorithms.map(a => (
            <button 
              key={a.id}
              className={`algo-btn ${selectedAlgoId === a.id ? 'active' : ''}`}
              onClick={() => setSelectedAlgoId(a.id)}
            >
              {a.name} ({a.bits}-bit)
            </button>
          ))}
        </div>
      </div>

      <div className="main-grid">
        <div className="glass-panel">
          <h2 className="section-title"><Fingerprint size={20} /> Primary Input</h2>
          <div className="input-group">
            <input 
              type="text" 
              value={input1} 
              onChange={(e) => setInput1(e.target.value)} 
              placeholder="Type something to hash..."
            />
          </div>
          <div className="hash-output-box">
            {hash1 || 'No output'}
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="value">{hash1.length * 4}</div>
              <div className="label">Bits Output</div>
            </div>
            <div className="stat-card">
              <div className="value">{algo.type.split('-')[0]}</div>
              <div className="label">Type</div>
            </div>
          </div>
          
          <div className="visualizer-container" style={{ marginTop: '2rem' }}>
            <div className="canvas-wrapper">
              <HashVisualizer hashHex={hash1} algorithmType={algo.type} size={280} />
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h2 className="section-title"><Activity size={20} /> Avalanche Effect Test</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Change a single character to see how it radically alters the hash and the geometry.
          </p>
          <div className="input-group">
            <input 
              type="text" 
              value={input2} 
              onChange={(e) => setInput2(e.target.value)} 
              placeholder="Type secondary text..."
            />
          </div>
          <div className="hash-output-box">
            {renderHighlightedHash(hash2, hash1)}
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="value" style={{ color: 'var(--error-color)'}}>{diffStats.distance}</div>
              <div className="label">Bits Changed</div>
            </div>
            <div className="stat-card">
              <div className={`value ${diffStats.percent > 40 && diffStats.percent < 60 ? 'diff-good' : 'diff-bad'}`} style={{ background: 'transparent' }}>
                {diffStats.percent.toFixed(1)}%
              </div>
              <div className="label">Diff (Ideal ~50%)</div>
            </div>
          </div>

          <div className="visualizer-container" style={{ marginTop: '2rem' }}>
            <div className="canvas-wrapper">
              <HashVisualizer hashHex={hash2} algorithmType={algo.type} size={280} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="section-title"><Clock size={20} /> Timing & Performance Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Compare the computational cost of each algorithm (5,000 iterations). Cryptographic hashes are intentionally slower to resist brute-force attacks.
        </p>
        
        <button className="algo-btn active" onClick={runBenchmarks} disabled={isBenchmarking}>
          {isBenchmarking ? 'Benchmarking...' : <><Zap size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}} /> Run Benchmark</>}
        </button>

        {Object.keys(benchmarks).length > 0 && (
          <div className="benchmark-list">
            {algorithms.map(a => {
              const time = benchmarks[a.id];
              const width = time ? `${(time / maxBenchmarkTime) * 100}%` : '0%';
              return (
                <div key={a.id} className="benchmark-item">
                  <div className="benchmark-header">
                    <span className="benchmark-name">{a.name}</span>
                    <span>{time ? `${time.toFixed(2)} ms` : '...'}</span>
                  </div>
                  <div className="timing-bar">
                    <div className="timing-fill" style={{ width }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
