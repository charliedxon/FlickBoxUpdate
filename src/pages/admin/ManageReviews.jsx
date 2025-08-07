// src/pages/admin/ModerasiReview.jsx
import { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaTrash, FaSearch } from "react-icons/fa";

const ModerasiReview = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setReviews([
        { id: 1, user: "User123", film: "Inception", rating: 5, text: "Amazing!", status: "pending" },
        { id: 2, user: "User456", film: "Interstellar", rating: 4, text: "Great visuals.", status: "pending" },
        { id: 3, user: "User789", film: "Dune: Part Two", rating: 3, text: "Too long.", status: "approved" },
        { id: 4, user: "User101", film: "Oppenheimer", rating: 2, text: "Not my taste.", status: "rejected" },
      ]);
    }, 500);
  }, []);

  const handleApprove = (id) =>
    setReviews(r => r.map(rv => rv.id === id ? { ...rv, status: "approved" } : rv));

  const handleReject = (id) =>
    setReviews(r => r.map(rv => rv.id === id ? { ...rv, status: "rejected" } : rv));

  const handleDelete = (id) =>
    setReviews(r => r.filter(rv => rv.id !== id));

  const filtered = reviews.filter(rv =>
    rv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rv.film.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rv.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const color = {
      approved: "bg-green-600",
      rejected: "bg-red-600",
      pending: "bg-yellow-600",
    }[status] || "bg-gray-500";

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-wide">Moderasi Review</h1>
        <div className="flex items-center bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 shadow-sm">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan user, film, atau isi..."
            className="ml-2 bg-transparent outline-none text-sm placeholder-gray-400 w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 mt-8 text-center">Tidak ada review ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <p>
                    <span className="font-semibold">{review.user}</span> menulis tentang <span className="italic">"{review.film}"</span>
                  </p>
                  <p className="mt-1 text-sm text-yellow-300">Rating: {review.rating}/5</p>
                  <p className="mt-2 text-gray-300">"{review.text}"</p>
                  <div className="mt-2">{getStatusBadge(review.status)}</div>
                </div>

                <div className="flex space-x-2 mt-3 md:mt-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-sm rounded-md transition"
                    >
                      <FaCheck /> <span className="hidden sm:inline">Approve</span>
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-sm rounded-md transition"
                    >
                      <FaTimes /> <span className="hidden sm:inline">Reject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-sm rounded-md transition"
                  >
                    <FaTrash /> <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerasiReview;
