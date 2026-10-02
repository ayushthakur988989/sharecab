import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapService } from '../../services/mapService';
import { LocateFixed } from 'lucide-react';

const createCustomIcon = (color, labelText, type = 'pin') => {
  const svg = type === 'driver' ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#0F172A"/>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" fill="${color}"/>
      <circle cx="7" cy="17" r="2" fill="#FFF"/>
      <circle cx="17" cy="17" r="2" fill="#FFF"/>
    </svg>` : `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 32">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
    </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="display:flex; flex-direction:column; align-items:center;">
      ${svg}
      ${labelText ? `<span style="background:#0F172A; color:#FFF; font-size:10px; font-weight:600; padding:2px 6px; border-radius:10px; margin-top:2px; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${labelText}</span>` : ''}
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 40]
  });
};

const pickupIcon = createCustomIcon('#10B981', 'Pickup');
const dropIcon = createCustomIcon('#0F172A', 'Destination');
const sharedPickupIcon = createCustomIcon('#3B82F6', 'Co-Passenger');
const driverIcon = createCustomIcon('#10B981', 'Driver', 'driver');

function MapRecenter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export function MapView({
  pickup,
  destination,
  driverCoords,
  sharedStops = [],
  onSelectLocation,
  className = 'h-72 w-full rounded-2xl overflow-hidden'
}) {
  const [routePolyline, setRoutePolyline] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [durationMins, setDurationMins] = useState(null);
  const [loadingGps, setLoadingGps] = useState(false);

  useEffect(() => {
    if (pickup && destination) {
      mapService.getRoute(pickup, destination, sharedStops).then((res) => {
        if (res) {
          setRoutePolyline(res.polylinePoints);
          setBounds(res.bounds);
          setDistanceKm(res.distanceKm);
          setDurationMins(res.durationMins);
        }
      });
    }
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, sharedStops.length]);

  const defaultCenter = pickup ? [pickup.lat, pickup.lng] : [12.9716, 77.5946];

  const handleFetchDeviceGps = async () => {
    setLoadingGps(true);
    try {
      const gpsLoc = await mapService.getCurrentLocation();
      if (onSelectLocation) {
        onSelectLocation(gpsLoc);
      }
    } catch (e) {
      console.warn('GPS location fetch error:', e);
    } finally {
      setLoadingGps(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    if (onSelectLocation) {
      const loc = mapService.reverseGeocode(lat, lng);
      onSelectLocation(loc);
    }
  };

  return (
    <div className={`relative ${className} shadow-sm border border-slate-200/80`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onMapClick={handleMapClick} />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-xs text-left p-1">
                <strong className="text-emerald-700 block">Pickup Location</strong>
                <span>{pickup.name || pickup.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={dropIcon}>
            <Popup>
              <div className="text-xs text-left p-1">
                <strong className="text-slate-900 block">Destination Point</strong>
                <span>{destination.name || destination.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {driverCoords && (
          <Marker position={[driverCoords.lat, driverCoords.lng]} icon={driverIcon}>
            <Popup>Driver is en route</Popup>
          </Marker>
        )}

        {sharedStops.map((stop, index) => (
          <Marker key={index} position={[stop.lat, stop.lng]} icon={sharedPickupIcon}>
            <Popup>{stop.name || 'Co-passenger pickup stop'}</Popup>
          </Marker>
        ))}

        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            color="#064E3B"
            weight={7}
            opacity={0.3}
          />
        )}

        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            color="#10B981"
            weight={5}
            opacity={0.95}
          />
        )}

        {bounds && <MapRecenter bounds={bounds} />}
      </MapContainer>

      {/* Floating GPS Location Target Button */}
      <button
        type="button"
        onClick={handleFetchDeviceGps}
        className="absolute top-3 left-3 z-10 bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-full shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        title="Use Live GPS Location"
      >
        <LocateFixed className={`w-4 h-4 text-emerald-600 ${loadingGps ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Use My Live GPS</span>
      </button>

      {distanceKm && durationMins && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-emerald-400 font-bold">{distanceKm} km</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-200">~{durationMins} min travel</span>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs border border-slate-200 text-2xs font-semibold text-slate-700 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        Live GPS Map
      </div>
    </div>
  );
}
