import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon, MapPinIcon } from '@heroicons/react/20/solid';

// Interface til lokationsdata
interface Location {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

// Tilføj ny type interface
interface StoreType {
  name: string;
  isPresent: boolean;
}

// Hardcodede lokationer til test
const hardcodedLocations: Location[] = [
  { name: "Salling Aarhus", type: "Salling", latitude: 56.1528, longitude: 10.2097 },
  { name: "Magasin Aarhus", type: "Magasin", latitude: 56.1533, longitude: 10.2103 },
  { name: "Føtex Frederiks Allé", type: "Føtex", latitude: 56.1508, longitude: 10.2016 },
  { name: "Bilka Tilst", type: "Bilka", latitude: 56.1827, longitude: 10.1397 },
  { name: "Kvickly Bruuns Galleri", type: "Kvickly", latitude: 56.1497, longitude: 10.2097 },
  { name: "Rema 1000 Trøjborg", type: "Rema 1000", latitude: 56.1697, longitude: 10.2137 },
  { name: "Netto Vestergade", type: "Netto", latitude: 56.1567, longitude: 10.2037 },
  { name: "Lidl Randersvej", type: "Lidl", latitude: 56.1777, longitude: 10.2097 },
  { name: "Føtex Åbyhøj", type: "Føtex", latitude: 56.1558, longitude: 10.1647 },
  { name: "Rema 1000 Viby", type: "Rema 1000", latitude: 56.1297, longitude: 10.1597 },
  { name: "Netto Åbyhøj", type: "Netto", latitude: 56.1547, longitude: 10.1657 },
  { name: "Aldi Viby", type: "Aldi", latitude: 56.1287, longitude: 10.1587 },
  { name: "Meny Risskov", type: "Meny", latitude: 56.1947, longitude: 10.2177 },
  { name: "SuperBrugsen Højbjerg", type: "SuperBrugsen", latitude: 56.1197, longitude: 10.2097 },
  { name: "Fakta Aarhus C", type: "Fakta", latitude: 56.1527, longitude: 10.2067 },
  { name: "Bilka Skejby", type: "Bilka", latitude: 56.2027, longitude: 10.1897 },
  { name: "Føtex Storcenter Nord", type: "Føtex", latitude: 56.1727, longitude: 10.1937 },
  { name: "Rema 1000 Skejby", type: "Rema 1000", latitude: 56.2017, longitude: 10.1927 }
];

interface LocationFinderProps {
  initialLat?: number;
  initialLng?: number;
}

const LocationFinder: React.FC<LocationFinderProps> = ({ initialLat, initialLng }) => {
  const [userLat, setUserLat] = useState<string>(initialLat?.toString() || '');
  const [userLng, setUserLng] = useState<string>(initialLng?.toString() || '');
  const [radius, setRadius] = useState<string>('');
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  const [nearbyLocationsWithDistance, setNearbyLocationsWithDistance] = useState<
    (Location & { distance: number })[]
  >([]);

  // Opdater koordinater når props ændres
  useEffect(() => {
    if (initialLat) setUserLat(initialLat.toString());
    if (initialLng) setUserLng(initialLng.toString());
  }, [initialLat, initialLng]);

  // Funktion til at beregne afstand mellem to punkter (i kilometer)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Jordens radius i kilometer
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearbyLocations = () => {
    const userLatNum = parseFloat(userLat);
    const userLngNum = parseFloat(userLng);
    const radiusNum = parseFloat(radius);

    if (isNaN(userLatNum) || isNaN(userLngNum) || isNaN(radiusNum)) {
      setErrorMessage('Indtast venligst en gyldigt radius');
      setShowModal(true);
      return;
    }

    const locationsWithDistance = hardcodedLocations.map(location => {
      const distance = calculateDistance(
        userLatNum,
        userLngNum,
        location.latitude,
        location.longitude
      );
      return { ...location, distance };
    }).filter(loc => loc.distance <= radiusNum);

    // Sorter efter afstand
    locationsWithDistance.sort((a, b) => a.distance - b.distance);
    setNearbyLocationsWithDistance(locationsWithDistance);

    // Opdater butikstyper - sæt isPresent til false som default
    const types = Array.from(new Set(locationsWithDistance.map(loc => loc.type)))
      .map(type => ({ name: type, isPresent: false }));
    setStoreTypes(types);
    setNearbyLocations(locationsWithDistance);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex-1">
            <input
              type="text"
              placeholder="Breddegrad (f.eks. 56.1497)"
              value={userLat}
              onChange={(e) => setUserLat(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 
                dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                placeholder:text-xs placeholder:text-center
                transition-transform duration-200 ease-in-out transform focus:scale-105"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Længdegrad (f.eks. 10.2097)"
              value={userLng}
              onChange={(e) => setUserLng(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 
                dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                placeholder:text-xs placeholder:text-center
                transition-transform duration-200 ease-in-out transform focus:scale-105"
            />
          </div>
          <div className="w-32">
            <input
              type="number"
              placeholder="Radius (km)"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              min="0"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 
                dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                placeholder:text-xs placeholder:text-center
                transition-transform duration-200 ease-in-out transform focus:scale-105"
            />
          </div>
          <button
            onClick={findNearbyLocations}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-400 dark:to-purple-500 dark:hover:from-indigo-500 dark:hover:to-purple-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Søg
          </button>
      </div>


      {storeTypes.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="space-y-2 mb-6">
            {storeTypes.map((type, index) => (
              <div 
                key={index}
                className="flex items-center p-2"
              >
                <input
                  type="checkbox"
                  id={`type-${index}`}
                  checked={type.isPresent}
                  onChange={() => {
                    const newTypes = [...storeTypes];
                    newTypes[index].isPresent = !newTypes[index].isPresent;
                    setStoreTypes(newTypes);
                  }}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-700 rounded-full border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 mr-3"
                />
                <label 
                  htmlFor={`type-${index}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {type.name}
                </label>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

          <div className="space-y-2">
            {nearbyLocationsWithDistance.map((location, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 p-2"
              >
                <div className="flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  {location.name}
                </div>
                <div className="flex items-center ml-auto">
                  <MapPinIcon className="h-5 w-5 text-indigo-600 mx-2" />
                  {location.distance.toFixed(2)} km
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Fejl
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-300">
              {errorMessage}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFinder;
