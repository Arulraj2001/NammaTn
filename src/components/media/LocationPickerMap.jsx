'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in Next.js bundling
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// A helper component to handle map clicks and viewport pan updates
function MapEventsHandler({ onClick, districtCoords }) {
  const map = useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (districtCoords) {
      map.setView(districtCoords, 11);
    }
  }, [districtCoords, map]);

  return null;
}
import { DISTRICT_COORDS } from "@/lib/districts";


export default function LocationPickerMap({ districtSlug, latitude, longitude, onChange }) {
  const defaultCenter = [11.1271, 78.6569]; // Tamil Nadu center
  const districtCenter = districtSlug ? DISTRICT_COORDS[districtSlug] : null;
  const center = districtCenter || defaultCenter;
  const zoom = districtCenter ? 11 : 7;

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Pin Incident Location (Tap/Click map to set marker)
      </label>
      <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-10">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {latitude && longitude && (
            <Marker position={[latitude, longitude]} icon={defaultIcon} />
          )}
          <MapEventsHandler
            onClick={onChange}
            districtCoords={districtCenter}
          />
        </MapContainer>
      </div>
      {latitude && longitude ? (
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>Lat: {parseFloat(latitude).toFixed(6)}, Lng: {parseFloat(longitude).toFixed(6)}</span>
          <button
            type="button"
            onClick={() => {
              onChange(null, null);
            }}
            className="text-red-500 hover:text-red-600 font-semibold"
          >
            Clear Pin
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          No location pinned yet.
        </p>
      )}
    </div>
  );
}
