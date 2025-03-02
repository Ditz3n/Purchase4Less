import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineSearch, AiOutlineLoading3Quarters } from 'react-icons/ai';
import bilkaLogo from '../assets/bilka_logo.png';
import rema_1000_logo from '../assets/Rema_1000_logo.png';
import sparlogo from '../assets/spar_logo.png';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";
import { PlaceholdersAndVanishInput, PlaceholdersAndVanishInputRef } from "../components/ui/placeholders-and-vanish-input";

const sourceLogos: { [key: string]: string } = {
  Bilka: bilkaLogo,
  SPAR: sparlogo,
  "Rema 1000": rema_1000_logo  
};

interface ShoppingList {
  shoppingListId: number;
  title: string;
}

interface Product {
  name: string;
  price: number;
  store: string;
  logoUrl: string;
  brand: string;
  uniqueItemIdentifier: string;
  imageUrl?: string;
}

interface SearchSuggestion {
  identifier: string;
  name: string;
  imageUrl?: string;
}

const SearchProductPage: React.FC = () => {
  const [activeSearch, setActiveSearch] = useState<SearchSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const suggestionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUniqueItemIdentifier, setSelectedUniqueItemIdentifier] = useState<string | null>(null);
  const inputRef = useRef<PlaceholdersAndVanishInputRef>(null);

  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchShoppingLists = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:5000/api/ShoppingList/shopper/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch shopping lists.');
        const lists = await response.json();
        setShoppingLists(lists);
      } catch (error) {
        console.error('Error fetching shopping lists:', error);
      }
    };

    fetchShoppingLists();
  }, [user, getToken]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [activeSearch]);
// Fetching the products from the backend when typing in the search bar
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const query = e.target.value;
    setSearchQuery(query);

    // Tjek om søgestrengen er mindre end 2 tegn
    if (query.length < 2) {
      setActiveSearch([]);
      setFilteredResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/Products?search=${query}`);
      if (!response.ok) throw new Error('Kunne ikke hente produkter.');

      const products = await response.json();
      
      // Gruppér produkter efter uniqueItemIdentifier og behold første billede
      const groupedProducts = products.reduce((acc: any, product: any) => {
        if (!acc[product.uniqueItemIdentifier]) {
          acc[product.uniqueItemIdentifier] = {
            identifier: product.uniqueItemIdentifier,
            name: product.name,
            imageUrl: product.imageUrl
          };
        }
        return acc;
      }, {});

      // Konverter til array og filtrer kun på uniqueItemIdentifier
      const suggestions = Object.values(groupedProducts)
        .filter((product: any) => 
          product.identifier.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8) as SearchSuggestion[];

      setActiveSearch(suggestions);
    } catch (error) {
      console.error('Fejl ved hentning af produkter:', error);
      setError('Der opstod en fejl ved søgning efter produkter. Prøv igen.');
      setActiveSearch([]);
    } finally {
      setLoading(false);
    }
  };

  // Arrow down and up for navigation in the suggestions list 
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => {
        const newIndex = Math.min(prevIndex + 1, activeSearch.length - 1);
        if (suggestionRefs.current[newIndex]) {
          suggestionRefs.current[newIndex]!.scrollIntoView({ block: 'nearest' });
        }
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => {
        const newIndex = Math.max(prevIndex - 1, 0);
        if (suggestionRefs.current[newIndex]) {
          suggestionRefs.current[newIndex]!.scrollIntoView({ block: 'nearest' });
        }
        return newIndex;
      });
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < activeSearch.length) {
        const selectedProduct = activeSearch[selectedIndex];
        handleSearchClick(selectedProduct.identifier);
        setSearchQuery('');
      } else {
        handleSearchClick();
        setSearchQuery('');
      }
      setActiveSearch([]);
    }
  };
// Fetching the products from the backend when clicking on a suggestion
  const handleSearchClick = async (query: string = searchQuery) => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setActiveSearch([]);
    setSearchQuery('');

    try {
      const response = await fetch(`http://localhost:5000/api/Products?search=${query}`);
      if (!response.ok) throw new Error('Kunne ikke hente produkter.');

      const products = await response.json();
      
      // Filtrer kun på uniqueItemIdentifier
      const filteredProducts = products.filter((product: any) =>
        product.uniqueItemIdentifier.toLowerCase().includes(query.toLowerCase())
      );

      // Mappe produkter inkl. UniqueItemIdentifier
      const mappedProducts = filteredProducts
        .flatMap((product: any) =>
          product.prices.map((price: any) => ({
            name: product.name,
            price: price.productPrice,
            store: price.source,
            logoUrl: sourceLogos[price.source] || '',
            brand: product.brand,
            uniqueItemIdentifier: product.uniqueItemIdentifier,
            imageUrl: product.imageUrl
          }))
        )
        .sort((a: Product, b: Product) => a.price - b.price);

      setFilteredResults(mappedProducts);
    } catch (error) {
      console.error('Fejl ved hentning af produkter:', error);
      setError('Der opstod en fejl ved søgning efter produkter. Prøv igen.');
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addProductToList = async (listId: number) => {
    if (!selectedUniqueItemIdentifier) return;
    
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/ShoppingListProduct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          shoppingListId: listId,
          uniqueItemIdentifier: selectedUniqueItemIdentifier
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server fejl:', errorData);
        throw new Error(errorData?.message || 'Kunne ikke tilføje produkt til listen');
      }

      toast({
        variant: "success",
        title: "Produkt tilføjet",
        description: "Produktet er blevet tilføjet til din indkøbsliste.",
      });
      
      // Nulstil alt efter succesfuld tilføjelse
      setIsModalOpen(false);
      setFilteredResults([]); // Nulstil viste produkter
      setSearchQuery(''); // Nulstil søgefeltet
      setActiveSearch([]); // Nulstil dropdown
      setSelectedUniqueItemIdentifier(null);
      
    } catch (error) {
      console.error('Fejl ved tilføjelse af produkt:', error);
      toast({
        variant: "destructive",
        title: "Fejl ved tilføjelse",
        description: "Dette produkt eksisterer allerede i listen!",
      });
    }
  };

  const openModal = (uniqueItemIdentifier: string) => {
    setSelectedUniqueItemIdentifier(uniqueItemIdentifier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUniqueItemIdentifier(null);
  };

  const placeholders = [
    "Søg efter mælk... ",
    "Du ligner en der skal have ost...",
    "Søg efter æg...",
    "Bananer er altid på tilbud når de er brune...",
    "Chokolade? Det er okay, jeg sladrer ikke...",
    "Søger du efter grøntsager? Godt gået!",
    "Pizza? Det er jo fredag... eller mandag... eller...",
    "Kaffe? Jeg forstår, morgenen er hård",
    "Toiletpapir? Better safe than sorry..."
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearchClick();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    inputRef.current?.triggerVanish();
    setSearchQuery('');
    setActiveSearch([]);
    handleSearchClick(suggestion.identifier);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <h1 className="text-5xl font-extrabold p-4 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Find produkt
      </h1>
      <p className="text-lg mb-6 text-center max-w-2xl text-gray-600 dark:text-gray-300 mx-auto leading-relaxed">
        Brug søgefeltet nedenfor til at finde produkter i vores katalog.
      </p>

      <div className="w-full max-w-md relative mb-10">
        <PlaceholdersAndVanishInput
          ref={inputRef}
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onKeyDown={handleKeyDown}
        />

        {activeSearch.length > 0 && (
          <div className="absolute top-14 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full rounded-xl left-1/2 -translate-x-1/2 flex flex-col gap-2 max-h-96 overflow-y-auto mb-10 shadow-lg border border-gray-200 dark:border-gray-700">
            {activeSearch.map((suggestion: any, index) => (
              <div
                key={index}
                ref={(el) => (suggestionRefs.current[index] = el)}
                className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded flex items-center gap-3 ${
                  selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <img
                  src={suggestion.imageUrl || 'https://via.placeholder.com/40'}
                  alt={suggestion.name}
                  className="w-10 h-10 object-contain rounded bg-white dark:bg-gray-900"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/40';
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{suggestion.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{suggestion.identifier}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-md">
        {error && <p className="text-red-500">{error}</p>}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(
              filteredResults.reduce((grouped, product) => {
                const identifier = product.uniqueItemIdentifier || 'unknown';
                if (!grouped[identifier]) {
                  grouped[identifier] = [];
                }
                grouped[identifier].push(product);
                return grouped;
              }, {} as Record<string, Product[]>)
            ).map(([identifier, products], index) => (
              <div
                key={index}
                className="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              >
                <h2 className="text-lg font-semibold">{identifier}</h2>
                
                <div className="w-full h-40 my-4">
                  <img
                    src={products[0]?.imageUrl || 'https://via.placeholder.com/150'}
                    alt={products[0]?.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>

                <div className="mt-2 space-y-2">
                  {products.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={product.logoUrl}
                          alt={product.store}
                          className="w-6 h-6"
                        />
                        <span>{product.store}</span>
                      </div>
                      <span className="font-bold">{product.price} kr.</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openModal(identifier)}
                  className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                >
                  Tilføj til liste
                </button>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>Ingen resultater fundet.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Vælg en indkøbsliste
            </h2>
            <div className="space-y-2">
              {shoppingLists.map((list) => (
                <button
                  key={list.shoppingListId}
                  onClick={() => addProductToList(list.shoppingListId)}
                  className="w-full p-3 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 flex justify-between items-center"
                >
                  <span>{list.title}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={closeModal}
              className="mt-6 w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Annuller
            </button>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default SearchProductPage;
