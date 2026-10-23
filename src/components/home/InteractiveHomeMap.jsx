'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from "@/lib/router-compat";
import { DISTRICT_COORDS } from "@/lib/districts";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Center of Tamil Nadu (Trichy coordinates) - Stable reference outside component
const DEFAULT_CENTER = [10.8505, 78.7047];

// Helper to center, fit bounds around nearby incidents when userLocation updates, without interfering with user manual zoom/pan
function ChangeMapView({ userLocation, nearbyClusters }) {
  const map = useMap();
  const prevLocKey = useRef(null);

  useEffect(() => {
    // Only adjust view when userLocation genuinely changes (e.g. user pressed 'Use My Location')
    const currentLocKey = userLocation ? `${userLocation.latitude},${userLocation.longitude}` : 'none';
    if (prevLocKey.current === currentLocKey) return;
    prevLocKey.current = currentLocKey;

    if (userLocation) {
      if (nearbyClusters && nearbyClusters.length > 0) {
        const userLat = parseFloat(userLocation.latitude);
        const userLng = parseFloat(userLocation.longitude);
        const bounds = L.latLngBounds([[userLat, userLng]]);
        nearbyClusters.forEach((c) => bounds.extend([c.latitude, c.longitude]));
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 11 });
      } else {
        map.setView([parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)], 10);
      }
    } else {
      map.setView(DEFAULT_CENTER, 7);
    }
  }, [userLocation, nearbyClusters, map]);

  return null;
}

// Controller to ensure mouse wheel zoom works smoothly and prevent page scroll interception
function MapInteractionController() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();

    const container = map.getContainer();
    const handleWheel = (e) => {
      // Allow Leaflet to zoom, but stop page from scrolling away while zooming the map
      e.stopPropagation();
    };
    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

  return null;
}

// Category / Incident metadata resolver
function getItemMeta(item) {

  if (item.category_slug === 'electricity' || item.category === 'electricity') {
    return {
      icon: '⚡',
      label: 'TANGEDCO / Electricity',
      color: '#d97706', // amber-600
      isUrgent: item.urgency_level === 'high' || item.urgency_level === 'critical',
      url: item.slug ? `/post/${item.slug}` : `/post/${item.id}`,
    };
  }

  if (item.category_slug === 'water-sanitation' || item.category === 'water') {
    return {
      icon: '💧',
      label: 'Water & Sanitation',
      color: '#0284c7', // sky-600
      isUrgent: item.urgency_level === 'high' || item.urgency_level === 'critical',
      url: item.slug ? `/post/${item.slug}` : `/post/${item.id}`,
    };
  }

  if (item.category_slug === 'road-infrastructure' || item.category_slug === 'transport') {
    return {
      icon: '🚧',
      label: 'Road & Transport',
      color: '#ea580c', // orange-600
      isUrgent: item.urgency_level === 'high' || item.urgency_level === 'critical',
      url: item.slug ? `/post/${item.slug}` : `/post/${item.id}`,
    };
  }

  if (item.urgency_level === 'critical' || item.urgency_level === 'high' || item.post_type === 'alert') {
    return {
      icon: '⚠️',
      label: 'Civic Alert',
      color: '#e11d48', // rose-600
      isUrgent: true,
      url: item.slug ? `/post/${item.slug}` : `/post/${item.id}`,
    };
  }

  return {
    icon: '📍',
    label: item.category_name || 'Civic Issue',
    color: '#2563eb', // blue-600
    isUrgent: false,
    url: item.slug ? `/post/${item.slug}` : `/post/${item.id}`,
  };
}

// Create single modern pin badge
function createSingleMarkerIcon(meta) {
  return L.divIcon({
    className: 'custom-civic-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background: ${meta.color};
        color: #ffffff;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        font-size: 13px;
        cursor: pointer;
      ">
        ${meta.isUrgent ? `
          <span style="
            position: absolute;
            top: -3px;
            right: -3px;
            width: 9px;
            height: 9px;
            background: #ef4444;
            border: 2px solid #ffffff;
            border-radius: 50%;
          "></span>
        ` : ''}
        <span>${meta.icon}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

// Create clustered pill badge for overlapping city incidents
function createClusterMarkerIcon(items, dominantMeta) {
  const count = items.length;
  const hasUrgent = items.some((it) => getItemMeta(it).isUrgent);
  const bg = hasUrgent ? '#dc2626' : (dominantMeta.color || '#1e293b');
  const width = count > 9 ? 46 : 40;

  return L.divIcon({
    className: 'custom-civic-cluster',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        width: ${width}px;
        height: 32px;
        background: ${bg};
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border-radius: 9999px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        cursor: pointer;
      ">
        <span style="font-size: 12px;">${dominantMeta.icon}</span>
        <span>${count}</span>
        ${hasUrgent ? `
          <span style="
            position: absolute;
            inset: -4px;
            border-radius: 9999px;
            border: 2px solid ${bg};
            opacity: 0.75;
          "></span>
        ` : ''}
      </div>
    `,
    iconSize: [width, 32],
    iconAnchor: [width / 2, 16],
    popupAnchor: [0, -18],
  });
}

// Modern user location radar puck
const userPuckIcon = L.divIcon({
  className: 'custom-user-puck',
  html: `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: #2563eb;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(37, 99, 235, 0.7);
    ">
      <span style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid #3b82f6;
        opacity: 0.6;
      "></span>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

// Group items sharing identical/near coordinates into single clean clusters
function clusterMapItems(rawItems, proximityDegrees = 0.035) {
  const normalized = [];

  for (const item of rawItems) {
    if (!item) continue;
    let lat = parseFloat(item.latitude);
    let lng = parseFloat(item.longitude);

    // Fall back to district coordinates if individual report has no precise GPS
    if (isNaN(lat) || isNaN(lng)) {
      if (item.district_slug && DISTRICT_COORDS[item.district_slug]) {
        [lat, lng] = DISTRICT_COORDS[item.district_slug];
      }
    }

    if (!isNaN(lat) && !isNaN(lng)) {
      normalized.push({
        ...item,
        _lat: lat,
        _lng: lng,
      });
    }
  }

  const clusters = [];
  for (const item of normalized) {
    const existing = clusters.find((c) => {
      const dLat = Math.abs(c.latitude - item._lat);
      const dLng = Math.abs(c.longitude - item._lng);
      return dLat <= proximityDegrees && dLng <= proximityDegrees;
    });

    if (existing) {
      existing.items.push(item);
    } else {
      clusters.push({
        id: `cluster-${clusters.length}-${item.id || item._lat.toFixed(2)}`,
        latitude: item._lat,
        longitude: item._lng,
        items: [item],
      });
    }
  }

  return clusters;
}

export default function InteractiveHomeMap({ items = [], userLocation = null, zoom = 7 }) {
  const initialCenter = userLocation
    ? [parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)]
    : DEFAULT_CENTER;
  const initialZoom = userLocation ? 10 : zoom;

  const clusters = useMemo(() => clusterMapItems(items), [items]);

  const nearbyClusters = useMemo(() => {
    if (!userLocation) return [];
    const uLat = parseFloat(userLocation.latitude);
    const uLng = parseFloat(userLocation.longitude);
    if (isNaN(uLat) || isNaN(uLng)) return [];
    return clusters.filter((c) => {
      const dist = calculateDistance(uLat, uLng, c.latitude, c.longitude);
      return dist <= 65;
    });
  }, [clusters, userLocation]);

  const currentActiveMarkerRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  const clearTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  const closeActivePopup = () => {
    clearTimer();
    if (currentActiveMarkerRef.current) {
      try {
        currentActiveMarkerRef.current.closePopup();
      } catch (_) {}
      currentActiveMarkerRef.current = null;
    }
  };

  const setAutoCloseTimeout = (ms = 3500) => {
    clearTimer();
    autoCloseTimerRef.current = setTimeout(() => {
      closeActivePopup();
    }, ms);
  };

  const getMarkerEventHandlers = () => ({
    mouseover: (e) => {
      const marker = e.target;
      if (currentActiveMarkerRef.current && currentActiveMarkerRef.current !== marker) {
        try {
          currentActiveMarkerRef.current.closePopup();
        } catch (_) {}
      }
      currentActiveMarkerRef.current = marker;
      marker.openPopup();

      // Auto close after 3.5s of no action
      setAutoCloseTimeout(3500);

      // Attach interaction listeners to the popup DOM node once rendered
      setTimeout(() => {
        const popupEl = marker.getPopup()?.getElement();
        if (popupEl) {
          // If user moves mouse over popup, refresh the 3.5s inactivity countdown so they can read/click
          popupEl.onmousemove = () => {
            setAutoCloseTimeout(3500);
          };
          // If mouse leaves popup, close after 1s
          popupEl.onmouseleave = () => {
            setAutoCloseTimeout(1000);
          };
        }
      }, 50);
    },
    mouseout: () => {
      // When cursor leaves the pin, give 1.2s to enter popup before closing
      setAutoCloseTimeout(1200);
    },
  });

  return (
    <div className="h-full w-full relative z-10">
      <style>{`
        .civic-map-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(226, 232, 240, 0.95);
          padding: 0;
          overflow: hidden;
        }
        .civic-map-popup .leaflet-popup-content {
          margin: 10px 12px;
          line-height: 1.35;
        }
        .civic-map-popup .leaflet-popup-tip {
          background: #ffffff;
        }
      `}</style>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        minZoom={6}
        maxZoom={16}
        scrollWheelZoom={true}
        wheelDebounceTime={30}
        wheelPxPerZoomLevel={50}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        attributionControl={false}
      >
        <MapInteractionController />
        <ChangeMapView
          userLocation={userLocation}
          nearbyClusters={nearbyClusters}
        />
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Radar Radius & Puck */}
        {userLocation && (
          <>
            <Circle
              center={[parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)]}
              radius={25000}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.10,
                weight: 1.5,
                dashArray: '5, 5',
              }}
            />
            <Marker
              position={[parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)]}
              icon={userPuckIcon}
              eventHandlers={getMarkerEventHandlers()}
            >
              <Popup
                className="civic-map-popup"
                autoPan={true}
                autoPanPaddingTopLeft={[25, 85]}
                autoPanPaddingBottomRight={[25, 45]}
                keepInView={true}
              >
                <div className="text-center font-bold text-xs p-1 text-slate-800">
                  📍 You are here / உங்கள் இடம்
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Clustered Civic Incidents */}
        {clusters.map((cluster) => {
          const isCluster = cluster.items.length > 1;
          const dominantItem = cluster.items.find((it) => getItemMeta(it).isUrgent) || cluster.items[0];
          const dominantMeta = getItemMeta(dominantItem);

          const icon = isCluster
            ? createClusterMarkerIcon(cluster.items, dominantMeta)
            : createSingleMarkerIcon(dominantMeta);

          const position = [cluster.latitude, cluster.longitude];

          const distKm = userLocation
            ? Math.round(
                calculateDistance(
                  parseFloat(userLocation.latitude),
                  parseFloat(userLocation.longitude),
                  cluster.latitude,
                  cluster.longitude
                )
              )
            : null;

          if (isCluster) {
            const areaName =
              cluster.items[0]?.area_name ||
              cluster.items[0]?.district_name ||
              cluster.items[0]?.district_slug ||
              'Area Reports';

            return (
              <Marker
                key={cluster.id}
                position={position}
                icon={icon}
                eventHandlers={getMarkerEventHandlers()}
              >
                <Popup
                  className="civic-map-popup"
                  autoPan={true}
                  autoPanPaddingTopLeft={[25, 85]}
                  autoPanPaddingBottomRight={[25, 45]}
                  keepInView={true}
                >
                  <div style={{ minWidth: '220px', maxWidth: '280px', maxHeight: '200px', overflowY: 'auto' }} className="p-0.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2 gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 capitalize truncate">
                          {areaName} ({cluster.items.length})
                        </span>
                        {distKm !== null && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-200 flex-shrink-0">
                            ~{distKm} km
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                        Active
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cluster.items.map((item, idx) => {
                        const meta = getItemMeta(item);
                        const title = item.title_en || item.title || 'Civic Incident';
                        return (
                          <div key={item.id || idx} className="text-xs border-b border-slate-100 pb-1.5 last:border-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span>{meta.icon}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate max-w-[140px]">
                                {meta.label}
                              </span>
                            </div>
                            <p className="font-semibold text-xs leading-snug line-clamp-2 text-slate-900 mb-1">
                              {title}
                            </p>
                            <Link
                              to={meta.url}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 hover:underline"
                            >
                              View Details →
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }

          // Single Incident Pin
          const single = cluster.items[0];
          const meta = dominantMeta;
          const title = single.title_en || single.title || 'Civic Report';
          const details = single.content_en || single.details || single.location_text || '';

          return (
            <Marker
              key={cluster.id}
              position={position}
              icon={icon}
              eventHandlers={getMarkerEventHandlers()}
            >
              <Popup
                className="civic-map-popup"
                autoPan={true}
                autoPanPaddingTopLeft={[25, 85]}
                autoPanPaddingBottomRight={[25, 45]}
                keepInView={true}
              >
                <div style={{ minWidth: '200px', maxWidth: '260px' }} className="p-0.5">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                      <span>{meta.icon}</span>
                      <span className="truncate max-w-[130px]">{meta.label}</span>
                    </div>
                    {distKm !== null && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-200 flex-shrink-0">
                        ~{distKm} km
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mb-1">
                    {title}
                  </p>
                  {details && (
                    <p className="text-[10px] text-slate-600 leading-normal line-clamp-2 mb-2">
                      {details}
                    </p>
                  )}
                  <Link
                    to={meta.url}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 hover:underline"
                  >
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
