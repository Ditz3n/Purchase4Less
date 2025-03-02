import React from 'react';

const TermsAndConditions: React.FC = () => {

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 dark:bg-gray-800 dark:text-white bg-white text-gray-800`}>
      <h1 className="text-5xl font-extrabold mb-4 p-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Vilkår og Betingelser
      </h1>
      <div className="max-w-3xl text-lg leading-relaxed">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Velkommen til Purchase4Less. Ved at bruge vores hjemmeside accepterer du følgende vilkår og betingelser. Læs venligst disse vilkår grundigt, før du bruger vores tjenester.
        </p>
        <h2 className="text-2xl font-bold mb-2">1. Accept af vilkår</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Ved at få adgang til og bruge denne hjemmeside accepterer du at være bundet af disse vilkår og betingelser samt alle gældende love og regler. Hvis du ikke accepterer nogen af disse vilkår, må du ikke bruge eller få adgang til denne hjemmeside.
        </p>
        <h2 className="text-2xl font-bold mb-2">2. Brug af indhold</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Alt indhold på denne hjemmeside, herunder tekst, grafik, logoer, billeder og software, tilhører Purchase4Less eller dets indholdsleverandører og er beskyttet af ophavsret og andre love om intellektuel ejendom. Du må ikke kopiere, ændre, distribuere eller bruge indholdet uden forudgående skriftlig tilladelse fra Purchase4Less.
        </p>
        <h2 className="text-2xl font-bold mb-2">3. Ansvarsfraskrivelse</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Purchase4Less leverer denne hjemmeside "som den er" og gør ingen garantier af nogen art, udtrykkelige eller underforståede, med hensyn til driften af hjemmesiden eller oplysninger, indhold, materialer eller produkter inkluderet på denne hjemmeside.
        </p>
        <h2 className="text-2xl font-bold mb-2">4. Ændringer af vilkår</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Purchase4Less forbeholder sig retten til at ændre disse vilkår og betingelser til enhver tid uden forudgående varsel. Ved at bruge denne hjemmeside accepterer du at være bundet af den aktuelle version af disse vilkår og betingelser.
        </p>
        <h2 className="text-2xl font-bold mb-2">5. Kontakt os</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Hvis du har spørgsmål om disse vilkår og betingelser, kan du kontakte os på info@purchase4less.com.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;