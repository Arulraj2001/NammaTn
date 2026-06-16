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

const DISTRICT_COORDS = {
  chennai: [13.0827, 80.2707],
  coimbatore: [11.0168, 76.9558],
  madurai: [9.9252, 78.1198],
  tiruchirappalli: [10.7905, 78.7047],
  salem: [11.6643, 78.1460],
  tirunelveli: [8.7139, 77.7567],
  vellore: [12.9165, 79.1325],
  erode: [11.3410, 77.7172],
  thoothukudi: [8.7642, 78.1348],
  dindigul: [10.3673, 77.9806],
  thanjavur: [10.7870, 79.1378],
  ranipet: [12.9260, 79.3330],
  sivaganga: [9.8433, 78.4800],
  virudhunagar: [9.5680, 77.9624],
  nagapattinam: [10.7672, 79.8444],
  kallakurichi: [11.7384, 78.9639],
  chengalpattu: [12.6926, 79.9765],
  tiruppur: [11.1085, 77.3411],
  tenkasi: [8.9591, 77.3146],
  mayiladuthurai: [11.1018, 79.6522],
  tirupattur: [12.4934, 78.5678],
  nilgiris: [11.4166, 76.6950],
  krishnagiri: [12.5266, 78.2148],
  dharmapuri: [12.1211, 78.1582],
  cuddalore: [11.7480, 79.7714],
  villupuram: [11.9401, 79.4861],
  perambalur: [11.2342, 78.8821],
  ariyalur: [11.1401, 79.0786],
  pudukkottai: [10.3833, 78.8167],
  ramanathapuram: [9.3639, 78.8394],
  theni: [10.0104, 77.4768],
  kancheepuram: [12.8342, 79.7036],
  tiruvarur: [10.7725, 79.6361],
  karur: [10.9601, 78.0766],
  namakkal: [11.2189, 78.1672],
  tiruvannamalai: [12.2253, 79.0747],
  kanyakumari: [8.0883, 77.5385],
  tiruvallur: [13.1384, 79.9075]
};

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
