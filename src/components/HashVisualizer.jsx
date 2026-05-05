import React, { useEffect, useRef } from 'react';

const hexToBin = (hex) => {
  return hex.split('').map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join('');
};

// Helper to convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) {
      r = g = b = l; 
  } else {
      const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export default function HashVisualizer({ hashHex, algorithmType, size = 280 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hashHex) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    const bin = hexToBin(hashHex);
    let paddedBin = bin;
    // Pad to ensure we have plenty of bits for points
    while(paddedBin.length < 2048) {
      paddedBin += bin;
    }

    const getParam = (index) => parseInt(paddedBin.substring((index * 8) % paddedBin.length, ((index + 1) * 8) % paddedBin.length) || '0', 2);

    // 25 to 45 points based on the first byte
    const pointsCount = 25 + (getParam(0) % 20); 
    const points = [];
    
    const globalHueShift = getParam(1) * (360/255);

    // Extract point coordinates and hues from hash bits
    for(let i=0; i<pointsCount; i++) {
        const offset = (i + 1) * 3;
        const pX = (getParam(offset) / 255) * size;
        const pY = (getParam(offset + 1) / 255) * size;
        // Map hue with global shift for unified color palettes
        const pHue = (globalHueShift + (getParam(offset + 2) * (180/255))) % 360;
        points.push({x: pX, y: pY, hue: pHue});
    }

    const isCrypto = algorithmType === 'cryptographic';

    // Compute Voronoi per pixel using brute-force distance checking
    for(let y=0; y<size; y++) {
        for(let x=0; x<size; x++) {
            let minDist1 = Infinity;
            let minDist2 = Infinity;
            let closestPoint = null;
            
            for(let i=0; i<pointsCount; i++) {
                const pt = points[i];
                // Euclidean distance squared
                const dx = x - pt.x;
                const dy = y - pt.y;
                const distSq = dx*dx + dy*dy;
                
                if (distSq < minDist1) {
                    minDist2 = minDist1;
                    minDist1 = distSq;
                    closestPoint = pt;
                } else if (distSq < minDist2) {
                    minDist2 = distSq;
                }
            }
            
            const dist1 = Math.sqrt(minDist1);
            const dist2 = Math.sqrt(minDist2);
            const isEdge = (dist2 - dist1) < 1.5; // Threshold for boundary

            let rgb;
            if (isEdge) {
                // Draw boundaries
                rgb = isCrypto ? [102, 252, 241] : [31, 40, 51]; // Neon cyan vs dark grey
            } else {
                // Cell coloring
                let lightness = 0.5 - (dist1 / (size/1.5)) * 0.3; 
                if (lightness < 0.2) lightness = 0.2;
                
                const sat = isCrypto ? 0.8 : 0.5;
                rgb = hslToRgb(closestPoint.hue, sat, lightness);
            }
            
            const pixelIndex = (y * size + x) * 4;
            data[pixelIndex] = rgb[0];
            data[pixelIndex+1] = rgb[1];
            data[pixelIndex+2] = rgb[2];
            data[pixelIndex+3] = 255;
        }
    }
    
    ctx.putImageData(imgData, 0, 0);

    // Draw the seed points
    ctx.fillStyle = isCrypto ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
    for(let i=0; i<pointsCount; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI*2);
        ctx.fill();
    }

  }, [hashHex, size, algorithmType]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size}
      style={{ 
        display: 'block', 
        borderRadius: '50%', // Circle mask looks great for Voronoi
        border: '2px solid rgba(102, 252, 241, 0.2)',
        boxShadow: '0 0 20px rgba(102, 252, 241, 0.1)'
      }}
    />
  );
}
