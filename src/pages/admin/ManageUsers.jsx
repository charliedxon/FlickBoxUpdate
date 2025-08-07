// src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaSearch, FaEdit, FaTrash, FaPlus, 
  FaChevronDown, FaChevronUp, FaUser, FaFilter,
  FaArrowLeft, FaSync, FaTimes, FaUserShield,
  FaUserCheck, FaUserTimes, FaCalendarAlt, FaBan,
  FaEnvelope, FaPhone, FaLock, FaLockOpen
} from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Initialize new user data structure
  const initialUserData = {
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  };
  
  const [newUserData, setNewUserData] = useState({...initialUserData});

  // Generate sample users
  const generateUsers = () => {
    const roles = ['admin', 'user']; // Only admin and user roles
    const statuses = ['active', 'inactive', 'suspended'];
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@${domains[Math.floor(Math.random() * domains.length)]}`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*365)).toISOString(),
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString()
    }));
  };

  useEffect(() => {
    // Simulate API call to fetch users
    setTimeout(() => {
      const data = generateUsers();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    }, 1500);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handle user deletion
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
    }
  };

  // Toggle user status
  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
        : user
    ));
  };

  // Suspend user
  const suspendUser = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: 'suspended' } : user
    ));
  };

  // Validate user form
  const validateForm = (userData) => {
    const errors = {};
    
    if (!userData.name.trim()) errors.name = 'Name is required';
    if (!userData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) errors.email = 'Email is invalid';
    
    return errors;
  };

  // Handle adding new user
  const handleAddUser = () => {
    const errors = validateForm(newUserData);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const newUser = {
      id: Date.now(), // Temporary ID
      ...newUserData,
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    setUsers([newUser, ...users]);
    setNewUserData({...initialUserData});
    setShowFormModal(false);
    setFormErrors({});
  };

  // Handle editing user
  const handleEditUser = () => {
    const errors = validateForm(editingUser);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    
    setUsers(updatedUsers);
    setEditingUser(null);
    setShowFormModal(false);
    setFormErrors({});
  };

  // Open form for adding new user
  const openAddUserForm = () => {
    setNewUserData({...initialUserData});
    setEditingUser(null);
    setShowFormModal(true);
    setFormErrors({});
  };

  // Open form for editing user
  const openEditUserForm = (user) => {
    setEditingUser(user);
    setNewUserData({...initialUserData});
    setShowFormModal(true);
    setFormErrors({});
  };

  // Close form modal
  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (editingUser) {
      setEditingUser({...editingUser, [name]: value});
    } else {
      setNewUserData({...newUserData, [name]: value});
    }
  };

  // Pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format datetime
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-900/50 text-green-400';
      case 'inactive': return 'bg-yellow-900/50 text-yellow-400';
      case 'suspended': return 'bg-red-900/50 text-red-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-900/50 text-purple-400';
      case 'user': return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold flex items-center">
            <FaUsers className="mr-3 text-blue-400" />
            User Management
          </h1>
          <button 
            onClick={() => {
              const data = generateUsers();
              setUsers(data);
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            <FaSync className="mr-2" /> Refresh
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
                  <FaSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="ml-2 bg-transparent outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="ml-3 flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                <FaFilter className="mr-2" /> 
                Filters {showFilters ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
              </button>
            </div>
            
            <button 
              onClick={openAddUserForm}
              className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full md:w-auto mt-4 md:mt-0 justify-center"
            >
              <FaPlus className="mr-2" /> Add New User
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Role</label>
                <select
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Status</label>
                <select
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Results: {filteredUsers.length}</label>
                <button 
                  onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button 
                  onClick={closeFormModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                      value={editingUser?.name || newUserData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                    {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                      value={editingUser?.email || newUserData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                      value={editingUser?.phone || newUserData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Role</label>
                      <select
                        name="role"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                        value={editingUser?.role || newUserData.role}
                        onChange={handleInputChange}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2">Status</label>
                      <select
                        name="status"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                        value={editingUser?.status || newUserData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    onClick={closeFormModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={editingUser ? handleEditUser : handleAddUser}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Contact</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Last Login</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="bg-gray-700 border border-gray-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <FaUser className="text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-400">
                              Joined: {formatDate(user.joinDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300">
                          <div className="flex items-center">
                            <FaEnvelope className="mr-2 text-blue-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center mt-2">
                            <FaPhone className="mr-2 text-green-400" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' && <FaUserShield className="mr-1" />}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status === 'active' && <FaUserCheck className="mr-1" />}
                          {user.status === 'suspended' && <FaBan className="mr-1" />}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-400">
                          {formatDateTime(user.lastLogin)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openEditUserForm(user)}
                            className="p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg text-blue-400"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-2 rounded-lg ${
                              user.status === 'active' 
                                ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400'
                                : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                            }`}
                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {user.status === 'active' ? <FaLock className="text-sm" /> : <FaLockOpen className="text-sm" />}
                          </button>
                          
                          <button 
                            onClick={() => suspendUser(user.id)}
                            className="p-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400"
                            title="Suspend"
                          >
                            <FaBan />
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-4">👥</div>
                      <h3 className="text-xl font-semibold mb-2">No users found</h3>
                      <p>Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {"<"}
              </button>
              
              {/* Always show first page */}
              <button
                key={1}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  currentPage === 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                onClick={() => paginate(1)}
              >
                1
              </button>
              
              {/* Show ellipsis if needed */}
              {currentPage > 3 && totalPages > 3 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              
              {/* Middle pages */}
              {Array.from({ length: Math.min(5, totalPages - 2) }).map((_, idx) => {
                let pageNum;
                if (currentPage <= 3) {
                  pageNum = idx + 2;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                
                // Only show pages between 2 and totalPages-1
                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              {/* Show ellipsis if needed */}
              {currentPage < totalPages - 2 && totalPages > 3 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              
              {/* Always show last page if there is more than 1 page */}
              {totalPages > 1 && (
                <button
                  key={totalPages}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === totalPages 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                  onClick={() => paginate(totalPages)}
                >
                  {totalPages}
                </button>
              )}
              
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {">"}
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-900/30 text-green-400 mr-4">
                <FaUsers />
              </div>
              <div>
                <h3 className="text-lg font-bold">Total Users</h3>
                <p className="text-3xl font-bold mt-1">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-900/30 text-purple-400 mr-4">
                <FaUserShield />
              </div>
              <div>
                <h3 className="text-lg font-bold">Admins</h3>
                <p className="text-3xl font-bold mt-1">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-900/30 text-green-400 mr-4">
                <FaUserCheck />
              </div>
              <div>
                <h3 className="text-lg font-bold">Active Users</h3>
                <p className="text-3xl font-bold mt-1">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;