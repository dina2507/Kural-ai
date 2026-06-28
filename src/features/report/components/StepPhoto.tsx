import React, { useRef, useState, useEffect } from 'react';
import { Camera, MapPin, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useReportWizard } from '../hooks/useReportWizard';

export function StepPhoto() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imagePreviewUrl, location, setImage, setLocation, setStep } = useReportWizard();
  const [isCompressing, setIsCompressing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!location) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation(pos.coords.latitude, pos.coords.longitude),
          (err) => setLocationError(err.message),
          { enableHighAccuracy: true }
        );
      } else {
        setLocationError('Geolocation not supported');
      }
    }
  }, [location, setLocation]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      
      const previewUrl = URL.createObjectURL(compressed);
      setImage(compressed, previewUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-text-primary">Report an Issue</h2>
        <p className="text-text-secondary text-sm">Take a clear photo of the civic issue.</p>
      </div>
      
      <div 
        className="w-full aspect-[4/3] bg-bg-surface border-2 border-dashed border-border rounded-xl overflow-hidden relative cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-6 text-text-tertiary">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Tap to upload photo</p>
          </div>
        )}
        
        {isCompressing && (
          <div className="absolute inset-0 bg-bg-base/80 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <div className="bg-bg-surface p-4 rounded-lg border border-border flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Location</p>
          {location ? (
            <p className="text-xs text-text-secondary font-mono">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
          ) : locationError ? (
            <p className="text-xs text-danger">{locationError}</p>
          ) : (
            <p className="text-xs text-text-secondary">Acquiring location...</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => setStep(2)}
        disabled={!imagePreviewUrl || !location || isCompressing}
        className="w-full py-4 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light transition-colors"
      >
        Analyze with AI &rarr;
      </button>
    </div>
  );
}
