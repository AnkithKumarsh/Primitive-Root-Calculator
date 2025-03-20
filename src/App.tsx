import React, { useState, useEffect } from 'react';
import { Calculator, Info, History, Download, RefreshCw, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [number, setNumber] = useState<string>('');
  const [primitiveRoots, setPrimitiveRoots] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [calculationHistory, setCalculationHistory] = useState<{number: number, roots: number[]}[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showExamples, setShowExamples] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const rootsPerPage = 20;

  // Calculate primitive roots when number changes
  useEffect(() => {
    if (number === '') {
      setPrimitiveRoots([]);
      setError('');
      return;
    }

    const num = parseInt(number);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a positive integer');
      setPrimitiveRoots([]);
      return;
    }

    setLoading(true);
    setError('');

    // Use setTimeout to prevent UI freezing for larger calculations
    setTimeout(() => {
      try {
        const roots = findPrimitiveRoots(num);
        setPrimitiveRoots(roots);
        setCurrentPage(0);
        
        if (roots.length === 0) {
          setError(`No primitive roots exist for ${num}`);
        } else {
          // Add to history if not already there
          if (!calculationHistory.some(item => item.number === num)) {
            setCalculationHistory(prev => [{number: num, roots}, ...prev].slice(0, 10));
          }
        }
      } catch (err) {
        setError('Error calculating primitive roots. Try a smaller number.');
        setPrimitiveRoots([]);
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [number, calculationHistory]);

  // Function to find primitive roots
  const findPrimitiveRoots = (n: number): number[] => {
    // For very large numbers, limit the calculation
    if (n > 10000) {
      throw new Error('Number too large for calculation');
    }

    // Find Euler's totient (phi) of n
    const phi = eulerTotient(n);
    
    // Find all primitive roots
    const primitiveRoots: number[] = [];
    
    // Check each number from 1 to n-1
    for (let g = 1; g < n; g++) {
      if (isPrimitiveRoot(g, n, phi)) {
        primitiveRoots.push(g);
      }
    }
    
    return primitiveRoots;
  };

  // Calculate Euler's totient function
  const eulerTotient = (n: number): number => {
    let result = n;
    
    // Consider all prime factors of n and subtract their multiples
    for (let p = 2; p * p <= n; p++) {
      // Check if p is a prime factor
      if (n % p === 0) {
        // If yes, then update n and result
        while (n % p === 0) {
          n /= p;
        }
        result -= result / p;
      }
    }
    
    // If n has a prime factor greater than sqrt(n)
    if (n > 1) {
      result -= result / n;
    }
    
    return result;
  };

  // Check if g is a primitive root modulo n
  const isPrimitiveRoot = (g: number, n: number, phi: number): boolean => {
    // If gcd(g, n) is not 1, g cannot be a primitive root
    if (gcd(g, n) !== 1) {
      return false;
    }
    
    // Find prime factors of phi(n)
    const primeFactors = findPrimeFactors(phi);
    
    // Check if g^(phi/p) mod n ≠ 1 for all prime factors p of phi(n)
    for (const p of primeFactors) {
      if (modPow(g, phi / p, n) === 1) {
        return false;
      }
    }
    
    return true;
  };

  // Find prime factors of n
  const findPrimeFactors = (n: number): Set<number> => {
    const factors = new Set<number>();
    
    // Check for divisibility by 2
    while (n % 2 === 0) {
      factors.add(2);
      n /= 2;
    }
    
    // Check for divisibility by odd numbers
    for (let i = 3; i * i <= n; i += 2) {
      while (n % i === 0) {
        factors.add(i);
        n /= i;
      }
    }
    
    // If n is a prime number greater than 2
    if (n > 2) {
      factors.add(n);
    }
    
    return factors;
  };

  // Calculate greatest common divisor
  const gcd = (a: number, b: number): number => {
    while (b) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  // Calculate (base^exponent) % modulus efficiently
  const modPow = (base: number, exponent: number, modulus: number): number => {
    if (modulus === 1) return 0;
    
    let result = 1;
    base = base % modulus;
    
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus;
      }
      exponent = Math.floor(exponent / 2);
      base = (base * base) % modulus;
    }
    
    return result;
  };

  // Download results as CSV
  const downloadCSV = () => {
    if (primitiveRoots.length === 0) return;
    
    const csvContent = `data:text/csv;charset=utf-8,Primitive Roots of ${number}\n${primitiveRoots.join(',')}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `primitive_roots_${number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load example
  const loadExample = (num: number) => {
    setNumber(num.toString());
    setShowExamples(false);
  };

  // Get current page of roots
  const getCurrentPageRoots = () => {
    const start = currentPage * rootsPerPage;
    const end = start + rootsPerPage;
    return primitiveRoots.slice(start, end);
  };

  // Calculate total pages
  const totalPages = Math.ceil(primitiveRoots.length / rootsPerPage);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-indigo-100 to-purple-100' 
        : 'bg-gradient-to-br from-gray-900 to-indigo-900'
    }`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${theme === 'light' ? 'bg-indigo-500' : 'bg-purple-500'} opacity-10`}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
            }}
            animate={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              rotate: 360,
            }}
            transition={{ 
              duration: Math.random() * 20 + 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center py-12 px-4">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            theme === 'light' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-800 text-indigo-100'
          } transition-colors duration-300`}
        >
          <Lightbulb size={20} />
        </button>

        <header className="w-full max-w-3xl mb-8 flex flex-col items-center">
          <motion.div 
            className="flex items-center mb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Calculator className={`h-10 w-10 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} mr-2`} />
            <h1 className={`text-4xl font-bold ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'}`}>
              Primitive Root Calculator
            </h1>
          </motion.div>
          <motion.p 
            className={`text-center max-w-xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Calculate all primitive roots modulo n for a given positive integer.
          </motion.p>
        </header>

        <main className={`w-full max-w-3xl ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        } rounded-xl shadow-lg overflow-hidden transition-colors duration-300 backdrop-blur-sm bg-opacity-90`}>
          <div className="p-6">
            <div className="mb-6">
              <label htmlFor="number" className={`block text-sm font-medium ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-200'
              } mb-1`}>
                Enter a positive integer:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    theme === 'light' ? 'border-gray-300 bg-white text-gray-800' : 'border-gray-600 bg-gray-700 text-white'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                  placeholder="e.g. 7"
                  min="1"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExamples(!showExamples)}
                  className={`px-4 py-2 ${
                    theme === 'light' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-800 text-indigo-100'
                  } rounded-md transition-colors duration-300`}
                >
                  Examples
                </motion.button>
              </div>

              <AnimatePresence>
                {showExamples && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-2 p-3 rounded-md ${
                      theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-900'
                    }`}>
                      <p className={`text-sm ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'} mb-2`}>
                        Common examples with primitive roots:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[7, 11, 13, 17, 19, 23, 29, 31].map(num => (
                          <button
                            key={num}
                            onClick={() => loadExample(num)}
                            className={`px-3 py-1 text-sm rounded-full ${
                              theme === 'light' 
                                ? 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300' 
                                : 'bg-indigo-700 text-indigo-100 hover:bg-indigo-600'
                            } transition-colors duration-200`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {loading && (
              <div className="flex justify-center my-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className={`rounded-full h-12 w-12 border-t-2 border-b-2 ${
                    theme === 'light' ? 'border-indigo-500' : 'border-indigo-400'
                  }`}
                />
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-l-4 p-4 mb-6 ${
                  theme === 'light' ? 'bg-red-50 border-red-400' : 'bg-red-900/30 border-red-700'
                }`}
              >
                <div className="flex">
                  <div className="ml-3">
                    <p className={`text-sm ${theme === 'light' ? 'text-red-700' : 'text-red-300'}`}>{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {!loading && primitiveRoots.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                    Primitive Roots of {number}:
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadCSV}
                    className={`flex items-center px-3 py-1 rounded-md text-sm ${
                      theme === 'light' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-green-800 text-green-100 hover:bg-green-700'
                    } transition-colors duration-200`}
                  >
                    <Download size={14} className="mr-1" />
                    Export CSV
                  </motion.button>
                </div>
                <div className={`p-4 rounded-md ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentPageRoots().map((root) => (
                      <motion.span
                        key={root}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          theme === 'light' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-indigo-800 text-indigo-100'
                        }`}
                      >
                        {root}
                      </motion.span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                      Found {primitiveRoots.length} primitive root{primitiveRoots.length !== 1 ? 's' : ''}
                    </p>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                          disabled={currentPage === 0}
                          className={`p-1 rounded ${
                            currentPage === 0 
                              ? 'opacity-50 cursor-not-allowed' 
                              : theme === 'light' 
                                ? 'hover:bg-indigo-100' 
                                : 'hover:bg-indigo-800'
                          }`}
                        >
                          <ChevronLeft size={16} className={theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'} />
                        </button>
                        
                        <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                          disabled={currentPage === totalPages - 1}
                          className={`p-1 rounded ${
                            currentPage === totalPages - 1 
                              ? 'opacity-50 cursor-not-allowed' 
                              : theme === 'light' 
                                ? 'hover:bg-indigo-100' 
                                : 'hover:bg-indigo-800'
                          }`}
                        >
                          <ChevronRight size={16} className={theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfo(!showInfo)}
                className={`flex items-center ${
                  theme === 'light' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-200'
                }`}
              >
                <Info className="h-4 w-4 mr-1" />
                {showInfo ? "Hide Information" : "What are Primitive Roots?"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center ${
                  theme === 'light' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-200'
                }`}
              >
                <History className="h-4 w-4 mr-1" />
                {showHistory ? "Hide History" : "View Calculation History"}
              </motion.button>
            </div>

            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 p-4 rounded-md ${
                    theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/50'
                  }`}>
                    <h3 className={`font-semibold ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'} mb-2`}>
                      Primitive Roots
                    </h3>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                      In modular arithmetic, a primitive root modulo n is an integer g such that for any integer a coprime to n, 
                      there exists some integer k such that g<sup>k</sup> ≡ a (mod n).
                    </p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                      In other words, g is a generator of the multiplicative group of integers modulo n.
                    </p>
                    <div className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      Primitive roots exist only for certain values of n:
                      <ul className="list-disc list-inside mt-1">
                        <li>n = 1, 2, 4</li>
                        <li>n = p<sup>k</sup> where p is an odd prime and k ≥ 1</li>
                        <li>n = 2p<sup>k</sup> where p is an odd prime and k ≥ 1</li>
                      </ul>
                    </div>
                    
                    <div className={`mt-3 p-3 rounded ${
                      theme === 'light' ? 'bg-indigo-100' : 'bg-indigo-800'
                    }`}>
                      <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'} mb-1`}>
                        Example: Primitive Roots of 7
                      </h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        The primitive roots of 7 are 3 and 5. This is because when we raise these numbers to powers 1 through 6 (which is φ(7) = 6), 
                        we get all numbers from 1 to 6 modulo 7.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 p-4 rounded-md ${
                    theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`font-semibold ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-200'}`}>
                        Calculation History
                      </h3>
                      {calculationHistory.length > 0 && (
                        <button
                          onClick={() => setCalculationHistory([])}
                          className={`text-xs ${
                            theme === 'light' ? 'text-red-600 hover:text-red-800' : 'text-red-400 hover:text-red-200'
                          }`}
                        >
                          Clear History
                        </button>
                      )}
                    </div>
                    
                    {calculationHistory.length === 0 ? (
                      <p className={`text-sm italic ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No calculations yet. Calculate some primitive roots to see your history.
                      </p>
                    ) : (
                      <div className={`divide-y ${theme === 'light' ? 'divide-indigo-200' : 'divide-indigo-700'}`}>
                        {calculationHistory.map((item, index) => (
                          <div key={index} className="py-2 first:pt-0 last:pb-0">
                            <div className="flex justify-between items-center">
                              <span className={`font-medium ${theme === 'light' ? 'text-indigo-700' : 'text-indigo-300'}`}>
                                n = {item.number}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setNumber(item.number.toString())}
                                  className={`text-xs flex items-center ${
                                    theme === 'light' 
                                      ? 'text-indigo-600 hover:text-indigo-800' 
                                      : 'text-indigo-400 hover:text-indigo-200'
                                  }`}
                                >
                                  <RefreshCw size={12} className="mr-1" />
                                  Recalculate
                                </button>
                              </div>
                            </div>
                            <p className={`text-xs mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                              {item.roots.length} primitive root{item.roots.length !== 1 ? 's' : ''}: 
                              {item.roots.length <= 10 
                                ? ` ${item.roots.join(', ')}` 
                                : ` ${item.roots.slice(0, 10).join(', ')}... and ${item.roots.length - 10} more`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className={`mt-8 text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
          <p>© 2025 Primitive Root Calculator</p>
        </footer>
      </div>
    </div>
  );
}

export default App;