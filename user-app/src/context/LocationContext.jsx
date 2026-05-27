import { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(
    JSON.parse(localStorage.getItem('qbx_loc') || 'null')
  );
  const [detecting, setDetecting] = useState(false);

  const saveLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem('qbx_loc', JSON.stringify(loc));
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('qbx_loc');
  };

  // GPS — Get live location + reverse geocode
  const detectGPS = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser does not support geolocation'));
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'Quickbitx/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const area = addr.suburb
                    || addr.neighbourhood
                    || addr.village
                    || addr.county
                    || addr.city_district
                    || 'Your Area';
          const city  = addr.city || addr.town || addr.state_district || '';
          const state = addr.state || '';
          const parts = [area, city, state].filter(Boolean);
          const loc = {
            lat, lng, area, city, state,
            displayLine: parts.join(', '),
            radius: 40,
          };
          saveLocation(loc);
          resolve(loc);
        } catch {
          const loc = {
            lat, lng,
            area: 'Current Location',
            city: '', state: '',
            displayLine: 'Current Location',
            radius: 40,
          };
          saveLocation(loc);
          resolve(loc);
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        reject(err);
      },
      { timeout: 12000, maximumAge: 300000, enableHighAccuracy: true }
    );
  });

  // Search by text
  const searchLocation = async (query) => {
    if (!query || query.trim().length < 3) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' India')}&format=json&limit=6&countrycodes=in&accept-language=en`,
        { headers: { 'User-Agent': 'Quickbitx/1.0' } }
      );
      const data = await res.json();
      return data.map(item => {
        const parts = item.display_name.split(',');
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          area: parts[0]?.trim() || 'Area',
          city: parts[1]?.trim() || '',
          state: parts[parts.length - 2]?.trim() || '',
          displayLine: parts.slice(0, 3).join(', '),
          radius: 40,
        };
      });
    } catch {
      return [];
    }
  };

  return (
    <LocationContext.Provider value={{
      location, saveLocation, clearLocation,
      detectGPS, searchLocation, detecting,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation2 = () => useContext(LocationContext);
// backward compat alias
export const useLocation = () => useContext(LocationContext);
