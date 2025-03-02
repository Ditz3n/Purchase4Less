import React from 'react';
import madsImage from '../images/mads.jpg';
import rubenImage from '../images/ruben.jpg';
import nahomImage from '../images/nahom.png';
import arneImage from '../images/arne.jpg';
import mustafaImage from '../images/mustafa.jpg';
import altafImage from '../images/altaf.jpg';
import daahirImage from '../images/daahir.png';
import shadiImage from '../images/shadi.png';



interface Member {
  name: string;
  profilePictureUrl: string;
}

const groupMembers: Member[] = [
  { name: 'Ruben Gullborg', profilePictureUrl: rubenImage },
  { name: 'Nahom M Tadesse', profilePictureUrl: nahomImage },
  { name: 'Altaf Rezai', profilePictureUrl: altafImage },
  { name: 'Mustafa Sagirkaya', profilePictureUrl: mustafaImage },
  { name: 'Arne Pedersen', profilePictureUrl: arneImage },
  { name: 'Daahir Abukar', profilePictureUrl: daahirImage },
  { name: 'Mads Villadsen', profilePictureUrl: madsImage },
  { name: 'Shadi Abou Staite', profilePictureUrl: shadiImage}
];

const AboutPage: React.FC = () => {

  return (
    <div className={`flex flex-col items-center bg-white text-gray-800 dark:bg-gray-800 dark:text-white justify-center min-h-screen p-6`}>
      <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Om os
      </h1>
      <p className="text-xl mb-4 max-w-3xl text-center">
        Purchase4Less er en platform, der hjælper dig med at finde de bedste tilbud på tværs af forskellige butikker. 
        Vi stræber efter at gøre din shoppingoplevelse så nem og økonomisk som muligt ved at give dig adgang til de 
        nyeste og bedste tilbud.
      </p>
      <p className="text-xl mb-4 max-w-3xl text-center">
        Vores mission er at hjælpe dig med at spare penge på dine daglige indkøb ved at sammenligne priser og finde 
        de bedste tilbud. Vi arbejder hårdt for at sikre, at du altid har adgang til de mest opdaterede og nøjagtige 
        oplysninger om priser og tilbud.
      </p>
      <p className="text-xl mb-4 max-w-3xl text-center">
        Tak fordi du bruger Purchase4Less. Vi håber, at du finder vores platform nyttig og at den hjælper dig med at 
        spare penge på dine indkøb.
      </p>

      <div className="mt-8">
        <h2 className="text-center mb-8 text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
            Mød vores team
        </h2>
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupMembers.map((member) => (
            <div 
              key={member.name} 
              className="flex flex-col items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md
                transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl
                cursor-pointer">
              <img
                src={member.profilePictureUrl}
                alt={`${member.name}'s profile`}
                className="w-24 h-24 rounded-full mb-4 object-cover"/>
              <h3 className="text-lg font-semibold">{member.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;