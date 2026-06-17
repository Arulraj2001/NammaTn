'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Color markers definitions
const createIcon = (color) => L.icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  user: createIcon('blue'),
  complaint: createIcon('red'),
  alert: createIcon('orange'),
  situation: createIcon('gold'),
  stay: createIcon('green'),
  listing: createIcon('violet')
};

// Helper component to center map viewport when coordinates change
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveHomeMap({ items = [], userLocation = null, zoom = 12 }) {
  const defaultCenter = [11.0168, 76.9558]; // Coimbatore default center
  const center = userLocation ? [parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)] : defaultCenter;
  const currentZoom = userLocation ? 14 : zoom;

  return (
    <div className="h-full w-full relative z-10">
      <MapContainer
        center={center}
        zoom={currentZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeMapView center={center} zoom={currentZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={icons.user}>
            <Popup>
              <div className="text-center font-semibold text-xs">You are here / உங்கள் இடம்</div>
            </Popup>
          </Marker>
        )}

        {/* Map items */}
        {items
          .filter(item => item.latitude && item.longitude)
          .map(item => {
            const position = [parseFloat(item.latitude), parseFloat(item.longitude)];
            
            // Choose marker icon color based on post type / category
            let icon = icons.complaint;
            let path = `/post/${item.id}`;
            let categoryName = item.category_name || item.post_type || 'Civic Post';

            if (item.post_type === 'stay' || item.stay_type) {
              icon = icons.stay;
              path = `/stay`;
              categoryName = 'Stay / PG';
            } else if (item.post_type === 'listing' || item.category === 'listings') {
              icon = icons.listing;
              path = `/listings`;
              categoryName = 'Local Listing';
            } else if (item.situation_type) {
              icon = icons.situation;
              path = `/situations`;
              categoryName = `Live Situation: ${item.situation_type.replace(/_/g, ' ')}`;
            } else if (item.scam_type) {
              icon = icons.alert;
              path = `/scams`;
              categoryName = 'Scam Alert';
            } else if (item.post_type === 'alert') {
              icon = icons.alert;
            }

            return (
              <Marker key={item.id} position={position} icon={icon}>
                <Popup>
                  <div className="p-1 max-w-[200px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{categoryName}</span>
                    <p className="font-bold text-xs text-slate-900 leading-tight mb-1">
                      {item.title_en || item.title || 'Untitled Report'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 mb-2">
                      {item.content_en || item.details || item.description || ''}
                    </p>
                    <Link to={path} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                      View Details / விவரங்கள் →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
