import StatsSection from '../components/statsSection';
import Hero from '../components/Hero';
import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from "@heroicons/react/20/solid";

// Define your static features and stats arrays
const features = [
  {
    name: "Sammenlign priser",
    description: (
      <>
        <br />Find de bedste tilbud på tværs af forskellige butikker
        og spar penge på dine daglige indkøb.
      </>
    ),
    icon: CloudArrowUpIcon,
  },
  {
    name: "Fortrolige data",
    description: (
      <>
        <br />Dine oplysninger er altid sikre og krypterede når du
        bruger vores platform.
      </>
    ),
    icon: LockClosedIcon,
  },
  {
    name: "Gem dine favoritter",
    description: (
      <>
        <br /> Gem dine foretrukne produkter og få besked når de er
        på tilbud i din lokale butik.
      </>
    ),
    icon: ServerIcon,
  },
];

// Static data to pass to the StatsSection component for display
const stats = [
  { id: 1, name: 'Gennemsnitlig besparelse', value: '85 kr', suffix: 'pr. indkøb' },
  { id: 2, name: 'Tilbud sammenlignet', value: '15.000+', suffix: 'dagligt' },
  { id: 3, name: 'Aktive brugere', value: '46.000+', suffix: 'og voksende' },
];

const MainPage: React.FC = () => {
  return (
    <>
      <Hero />
      
      <div className="overflow-hidden bg-white dark:bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  Spar tid og penge med
                </h2>
                <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                  Purchase4Less
                </p>
                <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
                  Med Purchase4Less får du overblik over de bedste tilbud og kan
                  nemt planlægge dine indkøb. Spar både tid og penge med vores
                  smarte løsninger.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 dark:text-gray-300 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900 dark:text-white">
                        <feature.icon
                          aria-hidden="true"
                          className="absolute left-1 top-1 h-5 w-5 text-indigo-600 dark:text-indigo-400"
                        />
                        {feature.name}
                      </dt>
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <img
              alt="Purchase4Less app screenshot"
              src="/hero_img.jpg"
              width={1920}
              height={1080}
              className="w-full max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 dark:ring-gray-700/10"
            />
          </div>
        </div>
      </div>

      {/* Pass stats to StatsSection */}
      <StatsSection stats={stats} /> {/* Display the statistics section */}
    </>
  );
};

export default MainPage;