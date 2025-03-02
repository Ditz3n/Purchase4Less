import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PrivacyPolicy: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-5xl font-extrabold mb-4 p-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Privatlivspolitik
      </h1>
      <div className="max-w-3xl text-lg leading-relaxed">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Hos Purchase4Less tager vi dit privatliv alvorligt. Denne privatlivspolitik forklarer, hvordan vi indsamler, bruger og beskytter dine personlige oplysninger.
        </p>
        <h2 className="text-2xl font-bold mb-2">1. Indsamling af oplysninger</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Vi indsamler oplysninger fra dig, når du registrerer dig på vores hjemmeside, foretager et køb, abonnerer på vores nyhedsbrev eller udfylder en formular. De indsamlede oplysninger kan omfatte dit navn, din e-mailadresse, din postadresse og dit telefonnummer.
        </p>
        <h2 className="text-2xl font-bold mb-2">2. Brug af oplysninger</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          De oplysninger, vi indsamler fra dig, kan bruges til at:
          <ul className="list-disc list-inside">
            <li>Forbedre vores hjemmeside</li>
            <li>Forbedre kundeservice</li>
            <li>Behandle transaktioner</li>
            <li>Sende periodiske e-mails</li>
          </ul>
        </p>
        <h2 className="text-2xl font-bold mb-2">3. Beskyttelse af oplysninger</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Vi implementerer en række sikkerhedsforanstaltninger for at opretholde sikkerheden af dine personlige oplysninger, når du foretager en ordre eller indtaster, sender eller får adgang til dine personlige oplysninger.
        </p>
        <h2 className="text-2xl font-bold mb-2">4. Videregivelse af oplysninger</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Vi sælger, handler eller på anden måde overfører ikke dine personligt identificerbare oplysninger til eksterne parter. Dette omfatter ikke betroede tredjeparter, der hjælper os med at drive vores hjemmeside, føre vores forretning eller servicere dig, så længe disse parter er enige om at holde disse oplysninger fortrolige.
        </p>
        <h2 className="text-2xl font-bold mb-2">5. Samtykke</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Ved at bruge vores hjemmeside giver du samtykke til vores privatlivspolitik.
        </p>
        <h2 className="text-2xl font-bold mb-2">6. Ændringer i vores privatlivspolitik</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Hvis vi beslutter at ændre vores privatlivspolitik, vil vi offentliggøre disse ændringer på denne side.
        </p>
        <h2 className="text-2xl font-bold mb-2">7. Kontakt os</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Hvis du har spørgsmål om denne privatlivspolitik, kan du kontakte os på info@purchase4less.com.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;