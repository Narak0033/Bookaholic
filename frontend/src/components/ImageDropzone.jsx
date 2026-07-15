import { useState, useRef, useCallback } from 'react';
import './ImageDropzone.css';

// Resize + compress in-browser so we don't store huge images
const processImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ImageDropzone({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      setError('');
      if (!file || !file.type.startsWith('image/')) {
        setError('Please drop an image file');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('Image is too large — try one under 8MB');
        return;
      }
      try {
        const dataUrl = await processImage(file);
        onChange(dataUrl);
      } catch {
        setError('Could not process that image');
      }
    },
    [onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="dropzone-wrap">
      {value ? (
        <div className="dropzone-preview">
          <img src={value} alt="Cover preview" />
          <button type="button" className="dropzone-remove" onClick={() => onChange('')}>
            remove
          </button>
        </div>
      ) : (
        <div
          className={`dropzone${dragging ? ' dropzone-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <p className="dropzone-text">drag a cover image here, or click to browse</p>
          <p className="dropzone-hint">JPG, PNG, or WebP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}
      {error && <p className="dropzone-error">{error}</p>}
    </div>
  );
}