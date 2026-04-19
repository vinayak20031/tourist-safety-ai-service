import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { MAP_CONFIG } from '../../utils/constants';

const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatData = points.map(p => [p.lat, p.lng, p.intensity || 0.5]);
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.1: '#3b82f6',
        0.3: '#22c55e',
        0.5: '#eab308',
        0.7: '#f97316',
        1.0: '#ef4444'
      }
    }).addTo(map);

    return () => map.removeLayer(heatLayer);
  }, [map, points]);

  return null;
};

const HeatmapView = ({ data = [] }) => {
  return (
    <div className="glass-card-solid overflow-hidden" style={{ height: '400px' }}>
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />
        <HeatLayer points={data} />
      </MapContainer>
    </div>
  );
};

export default HeatmapView;
