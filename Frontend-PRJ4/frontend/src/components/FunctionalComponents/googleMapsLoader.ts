import { Loader } from '@googlemaps/js-api-loader';

export const getGoogleMapsLoader = (apiKey: string) => {
  return new Loader({
    apiKey,
    version: "weekly",
    libraries: ["places"],
    region: 'DK',
    language: 'da',
    id: 'google-maps-script'
  });
};