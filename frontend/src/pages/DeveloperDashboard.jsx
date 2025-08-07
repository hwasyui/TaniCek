import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Buffer } from 'buffer';

const SIDEBAR_MENU = [
  { key: 'company', label: 'Company', icon: <svg className="w-5 h-5 mr-2 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3V7H4a1 1 0 00-1 1zm0 8v4a1 1 0 001 1h3v-5H4a1 1 0 00-1 1zm7-8v4a1 1 0 001 1h3V7h-3a1 1 0 00-1 1zm0 8v4a1 1 0 001 1h3v-5h-3a1 1 0 00-1 1zm7-8v4a1 1 0 001 1h3V7h-3a1 1 0 00-1 1zm0 8v4a1 1 0 001 1h3v-5h-3a1 1 0 00-1 1z" /></svg> },
  { key: 'users', label: 'Users', icon: <svg className="w-5 h-5 mr-2 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M3 20h5v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg> }
];

function DeveloperDashboard() {
  // State for selected company and search
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // State untuk data user dan loading
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // State untuk modal detail company
  const [showCompanyDetail, setShowCompanyDetail] = useState({ open: false, company: null, users: [] });
  const [companyDetailLoading, setCompanyDetailLoading] = useState(false);
  const [companyDetailModalOpen, setCompanyDetailModalOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Company CRUD state
  const [companies, setCompanies] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', address: '', image: null });
  const [editingCompany, setEditingCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDeleteCompany, setShowDeleteCompany] = useState({ open: false, company: null });
  const [companyError, setCompanyError] = useState('');

  // Helper: group users by company
  const groupUsersByCompany = (users) => {
    const grouped = {};
    users.forEach(user => {
      const companyId = user.company_id?._id || user.company_id || 'No Company';
      if (!grouped[companyId]) grouped[companyId] = [];
      grouped[companyId].push(user);
    });
    return grouped;
  };

  // Fetch all users saat tab users aktif
  React.useEffect(() => {
    if (activeTab === 'users') {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');
      let url = `http://localhost:3000/companies/${companyId}/user`;
      if (selectedCompany !== 'all') {
        url = `http://localhost:3000/companies/${selectedCompany}/user`;
      }
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.data)) {
            setAllUsers(data.data);
          } else {
            setAllUsers([]);
          }
          setUsersLoading(false);
        })
        .catch(() => {
          setAllUsers([]);
          setUsersLoading(false);
        });
    }
  }, [activeTab, selectedCompany]);
  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for Add Admin modal
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [addAdminError, setAddAdminError] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  // Handler for creating new admin
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setAddAdminError('');
    if (!newAdminForm.name.trim() || !newAdminForm.email.trim() || !newAdminForm.password.trim()) {
      setAddAdminError('All fields are required!');
      return;
    }
    setAddAdminLoading(true);
    const token = localStorage.getItem('token');
    try {
      const companyId = showCompanyDetail.company?._id;
      const res = await fetch(`http://localhost:3000/companies/${companyId}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAdminForm.name,
          email: newAdminForm.email,
          password: newAdminForm.password,
          isAdmin: true,
          company_id: showCompanyDetail.company?._id
        })
      });
      const data = await res.json();
      if (data && data.data) {
        setShowAddAdminModal(false);
        setNewAdminForm({ name: '', email: '', password: '' });
        // Optionally, refresh company detail users
        handleShowCompanyDetail(showCompanyDetail.company);
      } else {
        setAddAdminError(data.message || 'Failed to add admin!');
      }
    } catch {
      setAddAdminError('Failed to add admin!');
    } finally {
      setAddAdminLoading(false);
    }
  };
  

  // Fetch companies
  React.useEffect(() => {
    if (activeTab === 'company') {
      setCompanyLoading(true);
      const token = localStorage.getItem('token');
      fetch('http://localhost:3000/companies/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.data)) {
            setCompanies(data.data);
          } else {
            setCompanies([]);
          }
          setCompanyLoading(false);
        })
        .catch(() => {
          setCompanies([]);
          setCompanyLoading(false);
        });
    }
  }, [activeTab, showCompanyModal]);

  // Add/Edit company
  const handleCompanySubmit = (e) => {
    e.preventDefault();
    setCompanyError('');
    if (!companyForm.name.trim()) {
      setCompanyError('Company name is required!');
      return;
    }
    const token = localStorage.getItem('token');
    const method = editingCompany ? 'PUT' : 'POST';
    const url = editingCompany ? `http://localhost:3000/companies/${editingCompany._id}` : 'http://localhost:3000/companies/';
    const formData = new FormData();
    formData.append('name', companyForm.name);
    formData.append('address', companyForm.address || '');
    if (companyForm.image) formData.append('image', companyForm.image);
    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then(res => res.json())
      .then((res) => {
        if (res && res.data) {
          setShowCompanyModal(false);
          setEditingCompany(null);
          setCompanyForm({ name: '', address: '', image: null });
        } else {
          setCompanyError('Failed to save company!');
        }
      })
      .catch(() => setCompanyError('Failed to save company!'));
  };

  // Delete company
  const handleDeleteCompany = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/companies/${showDeleteCompany.company._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => {
        setShowDeleteCompany({ open: false, company: null });
        // Optionally, fetch companies again
      })
      .catch(() => setShowDeleteCompany({ open: false, company: null }));
  };
  // Show company detail (with users)
  const handleShowCompanyDetail = async (company) => {
    setCompanyDetailLoading(true);
    setCompanyDetailModalOpen(true);
    const token = localStorage.getItem('token');
    try {
      // Get company detail
      const res = await fetch(`http://localhost:3000/companies/${company._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Get users in company
      const userRes = await fetch(`http://localhost:3000/companies/${company._id}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setShowCompanyDetail({ open: true, company: data.data, users: Array.isArray(userData.data) ? userData.data : [] });
    } catch {
      setShowCompanyDetail({ open: true, company, users: [] });
    } finally {
      setCompanyDetailLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-yellow-50 overflow-x-hidden">
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-green-700 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h8M12 8v8" /></svg>
          <span className="text-xl font-extrabold tracking-wide">Developer Dashboard</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`bg-white shadow-xl border-r border-green-200 text-green-900 w-64 flex flex-col fixed top-0 left-0 h-screen z-40 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} md:translate-x-0`}> 
        <div className="flex items-center gap-2 px-6 py-5 border-b border-green-100 bg-green-700 text-white">
          <span className="text-xl font-extrabold tracking-wide">Developer Dashboard</span>
          
          {/* Close button for mobile sidebar */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 px-4 py-6">
          {SIDEBAR_MENU.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2 shadow-sm ${activeTab === key ? 'bg-yellow-400 text-black shadow-lg' : 'hover:bg-green-100 hover:text-green-900'}`}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <div className="px-4 pb-6">
          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-lg shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Log Out
          </button>
        </div>
      </nav>
      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 overflow-x-auto ${sidebarOpen ? 'md:ml-64' : 'md:ml-64'} ${sidebarOpen ? '' : 'ml-0'} pt-20 md:pt-7 p-4 sm:p-8`}> 
        {/* Company Management */}
        {activeTab === 'company' && (
        <section className="w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
            <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3V7H4a1 1 0 00-1 1zm0 8v4a1 1 0 001 1h3v-5H4a1 1 0 00-1 1zm7-8v4a1 1 0 001 1h3V7h-3a1 1 0 00-1 1zm0 8v4a1 1 0 001 1h3v-5h-3a1 1 0 00-1 1zm7-8v4a1 1 0 001 1h3V7h-3a1 1 0 00-1 1zm0 8v4a1 1 0 001 1h3v-5h-3a1 1 0 00-1 1z" /></svg>
            Company Management
          </h2>
          <div className="flex justify-end mb-4">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow-lg font-semibold flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400" onClick={() => { setEditingCompany(null); setCompanyForm({ name: '', description: '' }); setShowCompanyModal(true); }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Company
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 mb-8">
            {/* Loading animation */}
            {companyLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-10 w-10 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-green-700 font-semibold">Loading company data...</span>
              </div>
            ) : companies.length === 0 ? (
              <p className="text-gray-500">No company found.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-green-100">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Address</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company._id} className="border-t">
                      <td className="p-2 font-semibold">
                        <button className="text-green-700 underline hover:text-green-900" onClick={() => handleShowCompanyDetail(company)}>{company.name}</button>
                      </td>
                      {/* Modal Detail Company */}
                      {companyDetailModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full">
                            <h2 className="text-2xl font-bold mb-4 text-center text-green-800">Detail Company</h2>
                            {companyDetailLoading ? (
                              <div className="flex flex-col items-center justify-center py-12">
                                <svg className="animate-spin h-10 w-10 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                <span className="text-green-700 font-semibold">Loading company details...</span>
                              </div>
                            ) : (
                              <>
                                <div className="mb-4">
                                  <div className="flex gap-4 items-center">
                                    {showCompanyDetail.company.image && showCompanyDetail.company.image.data ? (
                                      <img src={`data:image/png;base64,${Array.isArray(showCompanyDetail.company.image.data) ? btoa(String.fromCharCode(...showCompanyDetail.company.image.data)) : showCompanyDetail.company.image.data}`} alt="Company" className="w-16 h-16 object-cover rounded-full border" />
                                    ) : (
                                      <span className="text-gray-400">No Image</span>
                                    )}
                                    <div>
                                      <div className="font-bold text-lg text-green-700">{showCompanyDetail.company.name}</div>
                                      <div className="text-gray-700">Address: {showCompanyDetail.company.address || '-'}</div>
                                      <div className="text-gray-700">ID: {showCompanyDetail.company._id}</div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-green-800">Users in Company</h3>
                                    <button
                                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded font-semibold shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                                      onClick={() => setShowAddAdminModal(true)}
                                    >
                                      + Add Administrator
                                    </button>
                                  </div>
          {/* Modal Add Administrator */}
          {showAddAdminModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-center text-yellow-800">Add Administrator</h2>
                <form onSubmit={handleAddAdminSubmit}>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col">
                      <label htmlFor="adminName" className="text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" name="adminName" id="adminName" placeholder="Name" value={newAdminForm.name} onChange={e => setNewAdminForm(f => ({ ...f, name: e.target.value }))} required className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="adminEmail" className="text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" name="adminEmail" id="adminEmail" placeholder="Email" value={newAdminForm.email} onChange={e => setNewAdminForm(f => ({ ...f, email: e.target.value }))} required className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="adminPassword" className="text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" name="adminPassword" id="adminPassword" placeholder="Password" value={newAdminForm.password} onChange={e => setNewAdminForm(f => ({ ...f, password: e.target.value }))} required className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all" />
                    </div>
                    {addAdminError && <div className="text-red-600 text-sm font-semibold mt-1 text-center animate-pulse">{addAdminError}</div>}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={() => setShowAddAdminModal(false)}>Cancel</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" disabled={addAdminLoading}>{addAdminLoading ? 'Adding...' : 'Add Admin'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
                                  {(() => {
                                    // Helper to get company_id as string
                                    const getCompanyIdString = (company_id) => {
                                      if (!company_id) return '';
                                      if (typeof company_id === 'string') return company_id;
                                      if (typeof company_id === 'object' && company_id !== null) {
                                        // Try _id property or toString
                                        if (company_id._id) return String(company_id._id);
                                        if (company_id.toString && typeof company_id.toString === 'function') return company_id.toString();
                                        return JSON.stringify(company_id);
                                      }
                                      return String(company_id);
                                    };
                                    const filteredUsers = showCompanyDetail.users.filter(user => {
                                      if (!user.company_id) return false;
                                      return getCompanyIdString(user.company_id) === String(showCompanyDetail.company._id);
                                    });
                                    // If no users matched, fallback to show all users (for debugging)
                                    if (filteredUsers.length === 0 && showCompanyDetail.users.length > 0) {
                                      return (
                                        <div>
                                          <div className="text-yellow-600 mb-2">Tidak ada user dengan company_id yang cocok. Menampilkan semua user untuk debugging:</div>
                                          <table className="w-full text-left text-sm mb-2">
                                            <thead className="bg-green-100">
                                              <tr>
                                                <th className="p-2">Name</th>
                                                <th className="p-2">Email</th>
                                                <th className="p-2">Role</th>
                                                <th className="p-2">company_id</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {showCompanyDetail.users.map(user => (
                                                <tr key={user._id} className="border-t">
                                                  <td className="p-2">{user.name}</td>
                                                  <td className="p-2">{user.email}</td>
                                                  <td className="p-2">{user.isAdmin ? 'Admin' : 'User'}</td>
                                                  <td className="p-2">{getCompanyIdString(user.company_id)}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    }
                                    if (filteredUsers.length === 0) {
                                      return <div className="text-gray-500">No users found.</div>;
                                    }
                                    return (
                                      <table className="w-full text-left text-sm mb-2">
                                        <thead className="bg-green-100">
                                          <tr>
                                            <th className="p-2">Name</th>
                                            <th className="p-2">Email</th>
                                            <th className="p-2">Role</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredUsers.map(user => (
                                            <tr key={user._id} className="border-t">
                                              <td className="p-2">{user.name}</td>
                                              <td className="p-2">{user.email}</td>
                                              <td className="p-2">
                                                <span className={`inline-flex items-center gap-2`}>
                                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{user.isAdmin ? 'Admin' : 'User'}</span>
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    );
                                  })()}
                                </div>
                                <div className="flex justify-end mt-4">
                                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={() => { setShowCompanyDetail({ open: false, company: null, users: [] }); setCompanyDetailModalOpen(false); }}>Close</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      <td className="p-2">{company.address || '-'}</td>
                      <td className="p-2">
                        {company.image && company.image.data ? (
                          <img src={`data:image/png;base64,${Array.isArray(company.image.data) ? btoa(String.fromCharCode(...company.image.data)) : company.image.data}`} alt="Company" className="w-12 h-12 object-cover rounded-full border" />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </td>
                      <td className="p-2 flex gap-2">
                        <button className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150" onClick={() => { setEditingCompany(company); setCompanyForm({ name: company.name, address: company.address || '', image: null }); setShowCompanyModal(true); }}>Edit</button>
                        <button className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-150" onClick={() => setShowDeleteCompany({ open: true, company })}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Modal Add/Edit Company */}
          {showCompanyModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-center text-green-800">{editingCompany ? 'Edit Company' : 'Add Company'}</h2>
                <form onSubmit={handleCompanySubmit} encType="multipart/form-data">
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" name="name" id="name" placeholder="Company Name" value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} required className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input type="text" name="address" id="address" placeholder="Address" value={companyForm.address} onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))} className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="image" className="text-sm font-medium text-gray-700 mb-1">Image</label>
                      <input type="file" name="image" id="image" accept="image/*" onChange={e => setCompanyForm(f => ({ ...f, image: e.target.files[0] }))} className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" />
                    </div>
                    {companyError && <div className="text-red-600 text-sm font-semibold mt-1 text-center animate-pulse">{companyError}</div>}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => { setShowCompanyModal(false); setEditingCompany(null); setCompanyForm({ name: '', address: '', image: null }); }}>Cancel</button>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-400 transition-all">{editingCompany ? 'Update' : 'Add'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Modal Delete Company */}
          {showDeleteCompany.open && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                <h2 className="text-xl font-bold text-center text-red-700 mb-4">Delete Confirmation</h2>
                <p className="text-center text-gray-700 mb-6">Are you sure to delete company <span className="font-semibold">{showDeleteCompany.company?.name}</span>? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={() => setShowDeleteCompany({ open: false, company: null })}>Cancel</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={handleDeleteCompany}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </section>
        )}
        {/* User Management */}
        {activeTab === 'users' && (
          <section className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
              <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M3 20h5v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
              User Management
            </h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="companySelect" className="block text-sm font-semibold text-green-700 mb-1">Filter by Company</label>
                <select
                  id="companySelect"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                >
                  <option value="all">All Companies</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="searchUser" className="block text-sm font-semibold text-green-700 mb-1">Search User</label>
                <input
                  id="searchUser"
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 mb-8">
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-10 w-10 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="text-green-700 font-semibold">Loading users...</span>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-green-700 mb-4">All Users Grouped by Company</h3>
                  {(() => {
                    const grouped = groupUsersByCompany(allUsers);
                    let entries = Object.entries(grouped);
                    if (selectedCompany !== 'all') {
                      entries = entries.filter(([companyId]) => companyId === selectedCompany);
                    }
                    if (entries.length === 0) {
                      return <div className="text-gray-500">No users found for this company.</div>;
                    }
                    return entries.map(([companyId, users]) => {
                      // Filter by search term
                      const filteredUsers = users.filter(user => {
                        const term = searchTerm.toLowerCase();
                        return (
                          user.name.toLowerCase().includes(term) ||
                          user.email.toLowerCase().includes(term)
                        );
                      });
                      if (filteredUsers.length === 0) return null;
                      return (
                        <div key={companyId} className="mb-8">
                          <div className="font-semibold text-green-800 mb-2 text-base">
                            {users[0]?.company_id?.name || (companyId === 'No Company' ? 'No Company' : companyId)}
                          </div>
                          <table className="w-full text-left text-sm mb-2">
                            <thead className="bg-green-100">
                              <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredUsers.map(user => (
                                <tr key={user._id} className="border-t">
                                  <td className="p-2">{user.name}</td>
                                  <td className="p-2">{user.email}</td>
                                  <td className="p-2">
                                    <span className={`inline-flex items-center gap-2`}>
                                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{user.isAdmin ? 'Admin' : 'User'}</span>
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredUsers.length === 0 && <div className="text-gray-500">No users found for this company.</div>}
                        </div>
                      );
                    });
                  })()}
                </>
              )}
            </div>
          </section>
        )}
      </main>
      {/* Modal Konfirmasi Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h2 className="text-xl font-bold text-center text-red-700 mb-4">Logout Confirmation</h2>
            <p className="text-center text-gray-700 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeveloperDashboard;