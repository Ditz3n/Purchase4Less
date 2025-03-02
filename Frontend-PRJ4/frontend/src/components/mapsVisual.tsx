import { useEffect, useRef, useState } from 'react';
import { getGoogleMapsLoader } from './FunctionalComponents/googleMapsLoader';
import LocationFinder from './location';
import { useTheme } from '../contexts/ThemeContext';
import { lightModeStyle, darkModeStyle } from '../contexts/mapStyles';  // Import the styles

interface MapProps {
  apiKey: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

const MapsVisual: React.FC<MapProps> = ({ apiKey, onLocationChange }) => {
  const { isDarkMode } = useTheme();  // Use the isDarkMode state from the theme context
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const loader = getGoogleMapsLoader(apiKey);

    const initializeMap = async () => {
      try {
        await loader.load();

        if (!isSubscribed || !mapRef.current || map.current) return;

        map.current = new google.maps.Map(mapRef.current, {
          center: { lat: 56.1629, lng: 10.2039 },
          zoom: 12,
          styles: isDarkMode ? darkModeStyle : lightModeStyle, // Apply the correct theme styles initially
        });

        infoWindow.current = new google.maps.InfoWindow();
        geocoder.current = new google.maps.Geocoder();

        // Setup autocomplete
        const input = document.getElementById('address-input') as HTMLInputElement;
        if (input && !autocomplete.current) {
          autocomplete.current = new google.maps.places.Autocomplete(input, {
            fields: ['formatted_address', 'geometry'],
            componentRestrictions: { country: 'dk' }
          });

          autocomplete.current.addListener('place_changed', () => {
            const place = autocomplete.current!.getPlace();

            if (place.geometry && place.geometry.location) {
              const pos = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };

              setCoordinates(pos);
              setAddress(place.formatted_address || '');

              if (onLocationChange) {
                onLocationChange(pos.lat, pos.lng);
              }

              if (map.current && infoWindow.current) {
                map.current.setCenter(pos);
                map.current.setZoom(15);

                infoWindow.current.setPosition(pos);
                infoWindow.current.setContent(
                  `<div>
                    <p><strong>Valgt placering</strong></p>
                    <p>${place.formatted_address}</p>
                  </div>`
                );
                infoWindow.current.open(map.current);
              }
            }
          });
        }
      } catch (error) {
        console.error('Fejl ved indlæsning af Google Maps:', error);
      }
    };

    initializeMap();

    return () => {
      isSubscribed = false;
      if (autocomplete.current) {
        google.maps.event.clearInstanceListeners(autocomplete.current);
      }
    };
  }, [isDarkMode, apiKey, onLocationChange]);  // Initialize map on first render (ignores theme changes for now)

  // Add a new useEffect to update the map styles whenever isDarkMode changes
  useEffect(() => {
    if (map.current) {
      // Change the map's styles when the theme toggles
      map.current.setOptions({
        styles: isDarkMode ? darkModeStyle : lightModeStyle,
      });
    }
  }, [isDarkMode]);  // This effect will run every time the theme changes

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    if (!geocoder.current) return;

    try {
      const response = await geocoder.current.geocode({
        location: { lat, lng }
      });

      if (response.results[0]) {
        const fullAddress = response.results[0].formatted_address;
        setAddress(fullAddress);
        return fullAddress;
      }
    } catch (error) {
      console.error('Geocoding fejlede:', error);
      return 'Kunne ikke finde adresse';
    }
  };

  const handleLocationClick = () => {
    if (!map.current || !infoWindow.current) return;
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCoordinates(pos);
          const addressText = await getAddressFromCoordinates(pos.lat, pos.lng);
          setAddress(addressText || '');

          infoWindow.current?.setPosition(pos);
          infoWindow.current?.setContent(
            `<div>
              <p><strong>Din placering</strong></p>
              <p>${addressText}</p>
            </div>`
          );
          infoWindow.current?.open(map.current);
          map.current?.setCenter(pos);
          map.current?.setZoom(15);
          setIsLoading(false);
        },
        () => {
          handleLocationError(true);
          setIsLoading(false);
        }
      );
    } else {
      handleLocationError(false);
      setIsLoading(false);
    }
  };

  const handleLocationError = (browserHasGeolocation: boolean) => {
    if (!map.current || !infoWindow.current) return;

    const pos = map.current.getCenter();
    if (!pos) return;

    infoWindow.current.setPosition(pos);
    infoWindow.current.setContent(
      browserHasGeolocation
        ? "Fejl: Kunne ikke finde din placering."
        : "Fejl: Din browser understøtter ikke lokationstjenester."
    );
    infoWindow.current.open(map.current);
    setAddress('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      geocodeAddress(address);
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!geocoder.current) return;

    try {
      const result = await geocoder.current.geocode({ address });

      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const pos = {
          lat: location.lat(),
          lng: location.lng()
        };

        setCoordinates(pos);
        if (onLocationChange) {
          onLocationChange(pos.lat, pos.lng);
        }

        if (map.current && infoWindow.current) {
          map.current.setCenter(pos);
          map.current.setZoom(15);

          infoWindow.current.setPosition(pos);
          infoWindow.current.setContent(
            `<div>
              <p><strong>Valgt placering</strong></p>
              <p>${result.results[0].formatted_address}</p>
            </div>`
          );
          infoWindow.current.open(map.current);
        }
      }
    } catch (error) {
      console.error('Geocoding fejlede:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <div ref={mapRef} className="h-full w-full" />
        <button 
          onClick={handleLocationClick}
          disabled={isLoading}
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 
            px-6 py-3 rounded-xl 
            bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-700 hover:to-purple-700 
            text-white transition-colors font-medium
            shadow-lg hover:shadow-2xl 
            disabled:opacity-50 disabled:cursor-not-allowed
            z-10 flex items-center gap-2`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>Finder placering...</span>
            </>
          ) : (
            'Find min placering'
          )}
        </button>
      </div>

      <div className="mt-4">
        <input
          id="address-input"
          type="text"
          value={address}
          onChange={handleAddressChange}
          onKeyDown={handleAddressKeyDown}
          className="w-full px-4 py-2 text-sm rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500
            bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white 
            border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-indigo-500 dark:focus:ring-indigo-400"
          placeholder="Søg efter adresse..."
        />
      </div>


      <div className="mt-6">
        <LocationFinder 
          initialLat={coordinates?.lat}
          initialLng={coordinates?.lng}
        />
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg 
    className="animate-spin h-5 w-5 text-white" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default MapsVisual;
