import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFilm, FaSearch, FaTrash, FaArrowLeft, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';

// API Key for TMDB (normally you'd store this in environment variables)
const API_KEY = '8f74ba3476a16e78682cadadd1456462';

export default function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showConfirm, setShowConfirm] = useState({ show: false, filmId: null });
  const [isSearching, setIsSearching] = useState(false);
  const [popularFilms, setPopularFilms] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);

  useEffect(() => {
    const fetchList = () => {
      setIsLoading(true);
      try {
        const savedLists = JSON.parse(localStorage.getItem('flickbox_lists')) || [];
        setLists(savedLists);
        const foundList = savedLists.find((l) => l.id === Number(id));
        
        if (!foundList) {
          navigate('/lists');
          return;
        }
        
        setList(foundList);
      } catch (error) {
        console.error("Failed to load list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [id, navigate]);

  // Fetch popular films when modal opens
  useEffect(() => {
    const fetchPopularFilms = async () => {
      if (showAddModal && !searchQuery) {
        setIsLoadingPopular(true);
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`
          );
          const data = await response.json();
          setPopularFilms(data.results);
        } catch (error) {
          console.error("Failed to fetch popular films:", error);
        } finally {
          setIsLoadingPopular(false);
        }
      }
    };

    fetchPopularFilms();
  }, [showAddModal, searchQuery]);

  // Debounced search handler
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Memoized film operations
  const handleAddFilmToList = useCallback((film) => {
    if (!list.films.some((f) => f.id === film.id)) {
      const newFilm = {
        id: film.id,
        title: film.title,
        year: film.release_date ? film.release_date.substring(0, 4) : 'N/A',
        poster: film.poster_path 
          ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
          : 'https://via.placeholder.com/300x450?text=No+Image',
        rating: film.vote_average ? (film.vote_average / 2).toFixed(1) : 'N/A'
      };
      
      const updatedList = {
        ...list,
        films: [...list.films, newFilm],
      };
      
      const updatedLists = lists.map((l) => 
        l.id === list.id ? updatedList : l
      );
      
      setLists(updatedLists);
      setList(updatedList);
      localStorage.setItem('flickbox_lists', JSON.stringify(updatedLists));
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [list, lists]);

  const handleRemoveFilm = useCallback((filmId) => {
    const updatedList = {
      ...list,
      films: list.films.filter((f) => f.id !== filmId),
    };
    
    const updatedLists = lists.map((l) => 
      l.id === list.id ? updatedList : l
    );
    
    setLists(updatedLists);
    setList(updatedList);
    localStorage.setItem('flickbox_lists', JSON.stringify(updatedLists));
    setShowConfirm({ show: false, filmId: null });
  }, [list, lists]);

  // Memoized film grid for performance
  const filmGrid = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (list?.films.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-auto">
            <FaFilm className="text-5xl text-blue-400 mx-auto mb-4 opacity-70" />
            <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
            <p className="text-gray-400 mb-6">Add your favorite films to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 mx-auto"
            >
              <FaPlus /> Add Films
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {list?.films.map((film) => (
          <div
            key={film.id}
            className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative pb-[150%]"> {/* Aspect ratio container */}
              {film.poster ? (
                <img 
                  src={film.poster} 
                  alt={film.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <FaFilm className="text-4xl text-gray-500" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-bold truncate">{film.title}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-300">{film.year}</span>
                  {film.rating && film.rating !== 'N/A' && (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                      {film.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowConfirm({ show: true, filmId: film.id })}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${film.title}`}
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  }, [list, isLoading]);

  if (!list && !isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">List Not Found</h2>
          <button
            onClick={() => navigate('/lists')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to My Lists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="py-12 px-6 bg-gradient-to-r from-blue-900 via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-0 left-0 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-800 border-2 border-dashed border-blue-500 rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <FaFilm className="text-3xl text-blue-400 opacity-70" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{list?.name}</h1>
            <p className="text-gray-300 max-w-2xl mx-auto mt-2 text-lg">
              {list?.description || "Your personalized film collection"}
            </p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {list?.films?.length || 0} films
              </span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                Created {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FILM LIST SECTION */}
      <section className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-blue-400">Film Collection</h2>
            <p className="text-gray-400">
              {list?.films?.length || 0} {list?.films?.length === 1 ? 'film' : 'films'} in your list
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/lists/edit/${id}`)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit List
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Film
            </button>
          </div>
        </div>

        {filmGrid}
      </section>

      {/* ADD FILM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-400">
                Add Film to <span className="text-white">{list?.name}</span>
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search films by title..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {isSearching ? (
                <div className="flex justify-center py-10">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                  {searchResults.map((film) => (
                    <div
                      key={film.id}
                      className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-600 rounded overflow-hidden">
                        {film.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${film.poster_path}`} 
                            alt={film.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaFilm className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-semibold">{film.title}</h3>
                        <div className="flex justify-between text-sm text-gray-300 mt-1">
                          <span>{film.release_date?.substring(0, 4) || 'Year N/A'}</span>
                          {film.vote_average && (
                            <span>Rating: {(film.vote_average / 2).toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddFilmToList(film)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        disabled={list?.films?.some(f => f.id === film.id)}
                      >
                        <FaPlus size={12} /> 
                        {list?.films?.some(f => f.id === film.id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-10 text-gray-400">
                  <FaSearch className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No films found for "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4 text-center">Popular Films</p>
                  {isLoadingPopular ? (
                    <div className="flex justify-center py-10">
                      <FaSpinner className="animate-spin text-3xl text-blue-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                      {popularFilms.slice(0, 6).map(film => (
                        <div 
                          key={film.id}
                          className="bg-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => handleAddFilmToList(film)}
                        >
                          <div className="aspect-[2/3] bg-gray-600 rounded mb-2 flex items-center justify-center overflow-hidden">
                            {film.poster_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w200${film.poster_path}`} 
                                alt={film.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaFilm className="text-gray-500" />
                            )}
                          </div>
                          <p className="text-sm truncate">{film.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CONFIRMATION MODAL */}
      {showConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <FaTrash className="text-red-500 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Remove Film</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to remove this film from your list?
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm({ show: false, filmId: null })}
                  className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveFilm(showConfirm.filmId)}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}