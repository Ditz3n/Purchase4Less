import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { ContainerScroll } from "./ui/container-scroll";

const Hero = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Products");
        const data = await response.json();
        const productsWithImages = data
          .filter((product: any) => product.imageUrl)
          .map((product: any) => {
            const lowestPrice = Math.min(...product.prices.map((p: any) => p.productPrice));
            const lowestPriceObj = product.prices.find((p: any) => p.productPrice === lowestPrice);
            
            return {
              ...product,
              lowestPrice: lowestPrice,
              storeName: lowestPriceObj?.source || 'Ingen butik fundet'
            };
          });
        setProducts(productsWithImages);
      } catch (error) {
        console.error("Fejl ved hentning af produkter:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Hurtigere interval for mere dynamisk følelse

    return () => clearInterval(timer);
  }, [products.length]);

  return (
    <>
      <section className="relative h-screen bg-white dark:bg-gray-800 overflow-hidden">
        {/* Baggrunds-dekoration */}
      

        <div className="relative h-full max-w-screen-xl mx-auto px-4 flex items-center">
          <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
            {/* Tekst sektion */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  Spar penge på dine daglige indkøb
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-normal max-w-2xl mx-auto lg:mx-0">
                Find de bedste tilbud på tværs af butikker og sammenlign priser
                nemt og hurtigt. Lad Purchase4Less hjælpe dig med at spare penge
                på dine indkøb.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/soeg-produkt"
                  className="inline-flex items-center justify-center px-6 py-4 text-lg font-medium text-white rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 transform hover:scale-105 transition-all duration-200"
                >
                  Start søgning
                  <MagnifyingGlassIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/om"
                  className="inline-flex items-center justify-center px-6 py-4 text-lg font-medium text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-200"
                >
                  Lær mere
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Slideshow sektion */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-2xl ring-1 ring-gray-900/10 dark:ring-gray-700/10">
                {products.length > 0 && (
                  <div className="relative h-full">
                    {products.map((product, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-8"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800">
        <ContainerScroll
          titleComponent={
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 pb-3">
              Udforsk tusindvis af varer
            </h1>
          }
        >
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 border border-gray-200 dark:border-gray-600"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {product.brand}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        Fra {product.lowestPrice?.toFixed(2)} kr.
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.storeName} 
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContainerScroll>
      </section>
    </>
  );
};

export default Hero;
