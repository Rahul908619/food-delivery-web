import { createContext, useContext, useState } from 'react';

export const CITIES = [
  { name: 'Delhi NCR',  lat: 28.6139, lng: 77.2090, radius: 25 },
  { name: 'Mumbai',     lat: 19.0760, lng: 72.8777, radius: 20 },
  { name: 'Bangalore',  lat: 12.9716, lng: 77.5946, radius: 20 },
  { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867, radius: 20 },
  { name: 'Chennai',    lat: 13.0827, lng: 80.2707, radius: 20 },
  { name: 'Kolkata',    lat: 22.5726, lng: 88.3639, radius: 20 },
  { name: 'Pune',       lat: 18.5204, lng: 73.8567, radius: 20 },
  { name: 'Ahmedabad',  lat: 23.0225, lng: 72.5714, radius: 20 },
  { name: 'Jaipur',     lat: 26.9124, lng: 75.7873, radius: 20 },
  { name: 'Ludhiana',   lat: 30.9010, lng: 75.8573, radius: 15 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, radius: 15 },
  { name: 'Surat',      lat: 21.1702, lng: 72.8311, radius: 15 },
  { name: 'Amritsar',   lat: 31.6340, lng: 74.8723, radius: 15 },
  { name: 'Nagpur',     lat: 21.1458, lng: 79.0882, radius: 15 },
  { name: 'Indore',     lat: 22.7196, lng: 75.8577, radius: 15 },
];

const CityContext = createContext();

export function CityProvider({ children }) {
  const [city, setCity] = useState(
    JSON.parse(localStorage.getItem('qbx_city') || 'null') || CITIES[0]
  );

  const selectCity = (c) => {
    setCity(c);
    localStorage.setItem('qbx_city', JSON.stringify(c));
  };

  return (
    <CityContext.Provider value={{ city, selectCity, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  );
}

export const useCity = () => useContext(CityContext);
