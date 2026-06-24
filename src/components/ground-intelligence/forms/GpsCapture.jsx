'use client';

import { useState } from 'react';
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const GPS_STATES = {
  IDLE:    'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR:   'error',
};

export default function GpsCapture({ onCapture }) {
  const [gpsState, setGpsState] = useState(GPS_STATES.IDLE);
  const [coords, setCoords]     = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleCapture() {
    if (!navigator.geolocation) {
      setGpsState(GPS_STATES.ERROR);
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGpsState(GPS_STATES.LOADING);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setGpsState(GPS_STATES.SUCCESS);
        if (typeof onCapture === 'function') {
          onCapture(latitude, longitude, accuracy);
        }
      },
      (error) => {
        setGpsState(GPS_STATES.ERROR);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission denied. Please allow access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location information is unavailable. Try again or enter manually.');
            break;
          case error.TIMEOUT:
            setErrorMsg('Location request timed out. Try again.');
            break;
          default:
            setErrorMsg('Could not get location — enter manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleRetry() {
    setGpsState(GPS_STATES.IDLE);
    setCoords(null);
    setErrorMsg('');
  }

  return (
    <div className="w-full space-y-2">
      {/* Main capture button */}
      {(gpsState === GPS_STATES.IDLE || gpsState === GPS_STATES.ERROR) && (
        <button
          type="button"
          onClick={handleCapture}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 w-full sm:w-auto"
        >
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>📍 Use My Location</span>
        </button>
      )}

      {/* Loading state */}
      {gpsState === GPS_STATES.LOADING && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Acquiring GPS signal…
          </span>
        </div>
      )}

      {/* Success state */}
      {gpsState === GPS_STATES.SUCCESS && coords && (
        <div className="space-y-2">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                GPS Captured
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 font-mono mt-0.5 break-all">
                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </p>
              {coords.accuracy && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  Accuracy: ±{Math.round(coords.accuracy)} m
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs text-green-700 dark:text-green-400 underline underline-offset-2 flex-shrink-0 hover:text-green-900 dark:hover:text-green-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {gpsState === GPS_STATES.ERROR && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Could not get location
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 leading-snug">
              {errorMsg || 'Enter your location manually below.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
