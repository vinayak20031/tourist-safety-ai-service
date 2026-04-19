import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import { MAP_CONFIG, SEVERITY_COLORS } from '../../utils/constants';
import { touristAPI, geofenceAPI } from '../../services/api';
import useSocket from '../../hooks/useSocket';
import L from 'leaflet';

const createMarkerIcon = (color = '#3b82f6', isAlert = false) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="width:${isAlert ? 18 : 14}px;height:${isAlert ? 18 : 14}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);${isAlert ? 'animation:pulse 1.5s infinite' : ''}"></div>`,
    iconSize: [isAlert ? 18 : 14, isAlert ? 18 : 14],
    iconAnchor: [isAlert ? 9 : 7, isAlert ? 9 : 7]
  });
};

const geofenceColors = {
  danger: { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15 },
  restricted: { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12 },
  safe: { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1 },
  warning: { color: '#eab308', fillColor: '#eab308', fillOpacity: 0.12 }
};

const LiveMap = ({ incidents = [] }) => {
  const [tourists, setTourists] = useState([]);
  const [geofences, setGeofences] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [touristRes, geoRes] = await Promise.all([
        touristAPI.getActive(),
        geofenceAPI.getAll({ active: true })
      ]);
      setTourists(touristRes.data || []);
      setGeofences(geoRes.data || []);
    } catch (err) {
      console.error('Map data fetch error:', err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time tourist location updates
  useSocket('tourist:location', (data) => {
    setTourists(prev => {
      const existing = prev.findIndex(t => t._id === data.userId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          lastKnownLocation: { type: 'Point', coordinates: data.coordinates },
          lastActive: data.timestamp
        };
        return updated;
      }
      return [...prev, {
        _id: data.userId,
        name: data.name,
        dtid: data.dtid,
        lastKnownLocation: { type: 'Point', coordinates: data.coordinates },
        lastActive: data.timestamp
      }];
    });
  });

  return (
    <div className="glass-card-solid overflow-hidden" style={{ height: '500px' }}>
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />

        {/* Geofence polygons */}
        {geofences.map(fence => (
          <Polygon
            key={fence._id}
            positions={fence.geometry.coordinates[0].map(c => [c[1], c[0]])}
            pathOptions={geofenceColors[fence.type] || geofenceColors.danger}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{fence.name}</p>
                <p className="text-gray-500 capitalize">{fence.type} Zone</p>
                <p className="text-xs mt-1">{fence.description}</p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Tourist markers */}
        {tourists.map(tourist => {
          if (!tourist.lastKnownLocation?.coordinates) return null;
          const [lng, lat] = tourist.lastKnownLocation.coordinates;
          return (
            <Marker
              key={tourist._id}
              position={[lat, lng]}
              icon={createMarkerIcon('#3b82f6')}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{tourist.name}</p>
                  <p className="text-gray-500 text-xs">{tourist.dtid}</p>
                  <p className="text-xs text-gray-400 mt-1">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Incident markers */}
        {incidents.filter(i => i.status === 'open' || i.status === 'investigating').map(incident => {
          if (!incident.location?.coordinates) return null;
          const [lng, lat] = incident.location.coordinates;
          const color = incident.severity === 'critical' ? '#ef4444' :
                        incident.severity === 'high' ? '#f97316' : '#eab308';
          return (
            <Marker
              key={incident._id}
              position={[lat, lng]}
              icon={createMarkerIcon(color, true)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold capitalize">{incident.type.replace('_', ' ')}</p>
                  <p className="text-xs capitalize">Severity: {incident.severity}</p>
                  <p className="text-xs text-gray-500 mt-1">{incident.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
