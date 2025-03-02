import { ArrowUpIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-gray-800">
      <div className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:pt-24">
        {/* Scroll to top knap */}
        <div className="absolute end-4 top-4 sm:end-6 sm:top-6 lg:end-8 lg:top-8">
        <button
          onClick={scrollToTop}
          className="inline-block rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-400 dark:to-purple-500 dark:hover:from-indigo-500 dark:hover:to-purple-600 p-2 text-white shadow transition sm:p-3 lg:p-4"
        >
          <span className="sr-only">Tilbage til toppen</span>
          <ArrowUpIcon className="h-5 w-5" />
        </button>
        </div>

        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <div className="flex justify-center text-indigo-600 lg:justify-start">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Purchase4Less
              </h2>
            </div>

            <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500 dark:text-gray-400 lg:text-left">
              Spar penge på dine daglige indkøb med Purchase4Less. <br />
              Vi hjælper dig med at finde de bedste tilbud på tværs af butikker.
            </p>
          </div>

          <ul className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:mt-0 lg:justify-end lg:gap-12">
            <li>
              <a className="text-gray-700 dark:text-gray-300 transition hover:text-indigo-600 dark:hover:text-indigo-400" href="/om">
                Om os
              </a>
            </li>
            <li>
              <a className="text-gray-700 dark:text-gray-300 transition hover:text-indigo-600 dark:hover:text-indigo-400" href="/kontakt">
                Kontakt
              </a>
            </li>
            <li>
              <a className="text-gray-700 dark:text-gray-300 transition hover:text-indigo-600 dark:hover:text-indigo-400" href="/vilkaar">
                Vilkår
              </a>
            </li>
            <li>
              <a className="text-gray-700 dark:text-gray-300 transition hover:text-indigo-600 dark:hover:text-indigo-400" href="/privatliv">
                Privatlivspolitik
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 lg:text-right">
          Copyright &copy; {new Date().getFullYear()} Purchase4Less. Alle rettigheder forbeholdes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;