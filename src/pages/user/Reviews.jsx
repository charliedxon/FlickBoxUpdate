import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaEdit, FaTrash, FaHeart, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

const API_KEY = '8f74ba3476a16e78682cadadd1456462';
const SEARCH_API_URL = 'https://api.themoviedb.org/3/search/movie';
const API_BASE_URL = 'http://localhost/backend';

const Reviews = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentScore, setSentimentScore] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [myReviews, setMyReviews] = useState([]);
  const [communityReviews, setCommunityReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [movieSearchResults, setMovieSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // State untuk form
  const [formData, setFormData] = useState({
    title: '',
    quote: '',
    rating: 5,
    poster: ''
  });
  
  // Fetch data reviews dari backend
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api.php`);
      const data = await response.json();
      
      // Transform field names: is_mine -> isMine
      const transformed = data.map(item => ({
        ...item,
        isMine: item.is_mine
      }));
      
      const myReviews = transformed.filter(review => review.isMine);
      const communityReviews = transformed.filter(review => !review.isMine);
      
      setMyReviews(myReviews);
      setCommunityReviews(communityReviews);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setIsLoading(false);
    }
  };

  // Load data saat komponen dimount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Gabungkan semua review untuk filter
  const allReviews = [...myReviews, ...communityReviews];
  
  const filteredReviews = allReviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = sentimentScore ? review.rating >= sentimentScore : true;
    
    // Filter berdasarkan tab aktif
    if (activeTab === 'mine') return matchesSearch && matchesSentiment && review.isMine;
    if (activeTab === 'community') return matchesSearch && matchesSentiment && !review.isMine;
    return matchesSearch && matchesSentiment;
  });
  
  const filteredMyReviews = filteredReviews.filter(review => review.isMine);
  const filteredOthersReviews = filteredReviews.filter(review => !review.isMine);
  
  // Fetch statistik untuk footer
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard.php`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);
  
  // Fungsi untuk menghapus review
  const handleDeleteReview = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api.php?id=${id}`, {
        method: 'DELETE'
      });
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };
  
  // Fungsi untuk menyukai review
  const handleLikeReview = async (id) => {
    try {
      const reviewToUpdate = communityReviews.find(review => review.id === id);
      if (!reviewToUpdate) return;
      
      const updatedLikes = reviewToUpdate.likes + 1;
      
      await fetch(`${API_BASE_URL}/api.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          likes: updatedLikes
        })
      });
      
      fetchReviews();
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };
  
  // Fungsi untuk membuka form tambah review
  const openAddForm = () => {
    setFormData({
      title: '',
      quote: '',
      rating: 5,
      poster: ''
    });
    setEditingReview(null);
    setShowForm(true);
  };
  
  // Fungsi untuk membuka form edit review
  const openEditForm = (review) => {
    setFormData({
      title: review.title,
      quote: review.quote,
      rating: review.rating,
      poster: review.poster
    });
    setEditingReview(review.id);
    setShowForm(true);
  };
  
  // Fungsi untuk menangani perubahan form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  // Fungsi untuk mencari film dari API TMDb (hanya film tahun 2000 ke atas)
  const searchMovies = async (query) => {
    if (!query.trim()) {
      setMovieSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `${SEARCH_API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
      );
      const data = await response.json();
      
      // Filter film yang memiliki tahun rilis 2000 ke atas
      const filteredResults = data.results.filter(movie => {
        if (!movie.release_date) return false;
        const year = new Date(movie.release_date).getFullYear();
        return year >= 2000;
      });
      
      setMovieSearchResults(filteredResults || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovieSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounced search effect
  useEffect(() => {
    if (formData.title && showForm) {
      const timerId = setTimeout(() => {
        searchMovies(formData.title);
      }, 500);
      
      return () => clearTimeout(timerId);
    } else {
      setMovieSearchResults([]);
    }
  }, [formData.title, showForm]);
  
  // Fungsi untuk memilih film dari hasil pencarian
  const handleMovieSelect = (movie) => {
    setFormData({
      ...formData,
      title: movie.title,
      poster: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/150x225?text=No+Poster'
    });
    setMovieSearchResults([]);
  };
  
  // Fungsi untuk menyimpan review
  const saveReview = async () => {
    if (!formData.title || !formData.quote) return;
    
    const newReview = {
      title: formData.title,
      reviewer: "Anda",
      avatar: "https://via.placeholder.com/50",
      quote: formData.quote,
      rating: Number(formData.rating),
      date: new Date().toISOString().split('T')[0],
      poster: formData.poster || "https://via.placeholder.com/150x225?text=Poster",
      is_mine: true,
      likes: 0
    };
    
    try {
      // Jika edit
      if (editingReview) {
        // Kirim permintaan PUT untuk update
        newReview.id = editingReview;
        
        await fetch(`${API_BASE_URL}/api.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newReview)
        });
      } else {
        // POST untuk review baru
        await fetch(`${API_BASE_URL}/api.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newReview)
        });
      }
      
      setShowForm(false);
      fetchReviews();
      
      // Tampilkan notifikasi sukses
      setNotification({
        type: 'success',
        message: editingReview ? 'Review berhasil diperbarui!' : 'Review berhasil ditambahkan!'
      });
      
      // Sembunyikan notifikasi setelah 3 detik
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error saving review:", error);
      
      // Tampilkan notifikasi error
      setNotification({
        type: 'error',
        message: 'Gagal menyimpan review. Silakan coba lagi.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };
  
  // Fungsi untuk render star rating input
  const renderStarRating = () => {
    return (
      <div className="flex items-center">
        {[1,2,3,4,5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-500'}`}
            onClick={() => setFormData({...formData, rating: star})}
          />
        ))}
        <span className="ml-2 text-yellow-400">{formData.rating}.0</span>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Memuat review...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Notifikasi */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <FaCheck className="mr-2" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Review Spotlight Hero */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="flex flex-col items-center justify-center h-full relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Film Review Community</h1>
          <p className="text-xl text-gray-300 max-w-2xl text-center px-4">
            Temukan review film terbaru dan bagikan pendapat Anda
          </p>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="px-6 py-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Cari film..."
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-gray-700 px-3 py-2 rounded-lg">
                <span className="mr-2 text-gray-300">Rating:</span>
                <select
                  value={sentimentScore}
                  onChange={(e) => setSentimentScore(Number(e.target.value))}
                  className="bg-gray-700 text-white border-0 focus:outline-none"
                >
                  <option value={0}>Semua Rating</option>
                  <option value={1}>⭐ 1+ Bintang</option>
                  <option value={2}>⭐⭐ 2+ Bintang</option>
                  <option value={3}>⭐⭐⭐ 3+ Bintang</option>
                  <option value={4}>⭐⭐⭐⭐ 4+ Bintang</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Bintang</option>
                </select>
              </div>
              
              <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                <button 
                  className={`px-4 py-2 ${activeTab === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'} focus:outline-none`}
                  onClick={() => setActiveTab('all')}
                >
                  Semua
                </button>
                <button 
                  className={`px-4 py-2 ${activeTab === 'mine' ? 'bg-blue-600' : 'hover:bg-gray-600'} focus:outline-none`}
                  onClick={() => setActiveTab('mine')}
                >
                  Review Saya
                </button>
                <button 
                  className={`px-4 py-2 ${activeTab === 'community' ? 'bg-blue-600' : 'hover:bg-gray-600'} focus:outline-none`}
                  onClick={() => setActiveTab('community')}
                >
                  Komunitas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Tambah/Edit Review */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingReview ? "Edit Review" : "Tambah Review Baru"}
              </h2>
              <button 
                className="text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setShowForm(false)}
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Judul Film</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan judul film"
                />
                
                {/* Movie search results dropdown */}
                {movieSearchResults.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto bg-gray-700 rounded-lg">
                    {movieSearchResults.map(movie => (
                      <div 
                        key={movie.id}
                        className="flex items-center p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        {movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                            alt={movie.title} 
                            className="w-12 h-16 object-cover rounded mr-3"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-600 rounded mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{movie.title}</div>
                          <div className="text-sm text-gray-400">
                            {movie.release_date ? movie.release_date.substring(0,4) : 'Unknown Year'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {isSearching && (
                  <div className="mt-2 text-center text-gray-400">
                    <FaSearch className="animate-pulse inline mr-2" />
                    Mencari film...
                  </div>
                )}
                
                {/* Pesan jika tidak ada hasil */}
                {!isSearching && formData.title && movieSearchResults.length === 0 && (
                  <div className="mt-2 text-center py-4 text-gray-400">
                    Tidak ditemukan film tahun 2000 ke atas
                  </div>
                )}
              </div>
              
              {/* Movie poster preview */}
              {formData.poster && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={formData.poster} 
                    alt="Selected movie poster" 
                    className="w-32 h-48 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-300 mb-2">Review Anda</label>
                <textarea
                  name="quote"
                  value={formData.quote}
                  onChange={handleFormChange}
                  rows="4"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tulis review Anda di sini..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Rating</label>
                {renderStarRating()}
              </div>
              
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold mt-4 focus:outline-none"
                onClick={saveReview}
                disabled={!formData.title || !formData.quote}
              >
                {editingReview ? "Simpan Perubahan" : "Tambahkan Review"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: My Reviews */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                <span className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {filteredMyReviews.length}
                </span>
                Review Saya
              </h2>
              {myReviews.length > 0 && (
                <button 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center focus:outline-none"
                  onClick={openAddForm}
                >
                  <FaPlus className="mr-2" /> Tambah Review
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {filteredMyReviews.length > 0 ? (
                filteredMyReviews.map(review => (
                  <div key={review.id} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all border-l-4 border-blue-500">
                    <div className="flex">
                      <img 
                        src={review.poster} 
                        alt={review.title} 
                        className="w-20 h-auto rounded-lg mr-4 object-cover" 
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="text-xl font-bold">{review.title}</h3>
                          <div className="flex">
                            <button 
                              className="text-gray-400 hover:text-blue-400 p-2 focus:outline-none"
                              onClick={() => openEditForm(review)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-red-500 p-2 focus:outline-none"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 text-gray-300">
                          <div className="flex items-center mr-4">
                            <span className="text-yellow-400 mr-1 flex">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < review.rating ? "text-yellow-400" : "text-gray-600"} 
                                />
                              ))}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 italic text-gray-200">"{review.quote}"</p>
                        <div className="flex items-center mt-3 text-sm text-gray-400">
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-lg">Belum ada review yang Anda buat</p>
                  <button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center mx-auto focus:outline-none"
                    onClick={openAddForm}
                  >
                    <FaPlus className="mr-2" /> Buat Review Pertama Anda
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Community Reviews */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-400 flex items-center">
                <span className="bg-green-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {filteredOthersReviews.length}
                </span>
                Review Komunitas
              </h2>
              <span className="text-gray-400 text-sm">
                {filteredOthersReviews.length} dari {communityReviews.length} review
              </span>
            </div>
            
            <div className="space-y-6">
              {filteredOthersReviews.length > 0 ? (
                filteredOthersReviews.map(review => (
                  <div key={review.id} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all border-l-4 border-green-500">
                    <div className="flex">
                      <img 
                        src={review.poster} 
                        alt={review.title} 
                        className="w-20 h-auto rounded-lg mr-4 object-cover" 
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="text-xl font-bold">{review.title}</h3>
                          <button 
                            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition flex items-center focus:outline-none"
                            onClick={() => handleLikeReview(review.id)}
                          >
                            <FaHeart className="mr-1 text-red-500" /> Suka
                          </button>
                        </div>
                        <div className="flex items-center mt-2">
                          <img 
                            src={review.avatar} 
                            alt={review.reviewer} 
                            className="w-8 h-8 rounded-full mr-2" 
                          />
                          <span className="font-medium">{review.reviewer}</span>
                        </div>
                        <div className="flex items-center mt-2 text-gray-300">
                          <div className="flex items-center mr-4">
                            <span className="text-yellow-400 mr-1 flex">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < review.rating ? "text-yellow-400" : "text-gray-600"} 
                                />
                              ))}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 italic text-gray-200">"{review.quote}"</p>
                        <div className="flex items-center mt-3 text-sm text-gray-400">
                          <span>{review.date}</span>
                          <span className="mx-2">•</span>
                          <span className="text-blue-400 flex items-center">
                            {review.likes} <FaHeart className="ml-1 text-red-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-lg">Tidak ada review komunitas yang ditemukan</p>
                  <p className="mt-2">Coba ubah filter pencarian Anda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Footer */}
      <footer className="py-6 px-6 border-t border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{stats.my_reviews}</div>
                <div className="text-gray-400">Review Anda</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{stats.community_reviews}</div>
                <div className="text-gray-400">Review Komunitas</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">{stats.total_reviews}</div>
                <div className="text-gray-400">Total Review</div>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-center mt-6 text-sm">
            © 2023 Film Review Community • Temukan film terbaik berdasarkan review komunitas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Reviews;