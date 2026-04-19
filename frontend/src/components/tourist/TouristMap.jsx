import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MAP_CONFIG } from '../../utils/constants';
import useGeolocation from '../../hooks/useGeolocation';
import L from 'leaflet';

// Custom tourist marker
const touristIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:24px;height:24px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const TouristMap = () => {
  const { position } = useGeolocation({ enabled: true });
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.defaultCenter);

  useEffect(() => {
    if (position?.coordinates) {
      setMapCenter([position.coordinates[1], position.coordinates[0]]);
    }
  }, [position]);

  return (
    <div className="glass-card-solid overflow-hidden" style={{ height: '400px' }}>
      <MapContainer
        center={mapCenter}
        zoom={MAP_CONFIG.defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />

        {position?.coordinates && (
          <>
            <Marker
              position={[position.coordinates[1], position.coordinates[0]]}
              icon={touristIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Your Location</p>
                  <p className="text-gray-500">
                    {position.coordinates[1].toFixed(6)}, {position.coordinates[0].toFixed(6)}
                  </p>
                  {position.speed > 0 && (
                    <p className="text-gray-500">Speed: {(position.speed * 3.6).toFixed(1)} km/h</p>
                  )}
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[position.coordinates[1], position.coordinates[0]]}
              radius={position.accuracy || 50}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default TouristMap;
