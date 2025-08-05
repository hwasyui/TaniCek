import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const [activeTab, setActiveTab] = useState('company');
    const [users, setUsers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [company, setCompany] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [aiHistory, setAiHistory] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);

    const [searchUser , setSearchUser ] = useState('');
    const [searchMachine, setSearchMachine] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentUser , setCurrentUser ] = useState(null);
    const [currentMachine, setCurrentMachine] = useState(null);

    const storedUser  = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    const user = storedUser  ? JSON.parse(storedUser ) : null;
    const companyId = user?.company;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    useEffect(() => {
        if (!user || !token) return navigate('/login');
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [companyRes, usersRes, machineRes, aiHistoryRes] = await Promise.all([
                fetch(`http://localhost:3000/companies/${companyId}`, { headers }),
                fetch(`http://localhost:3000/companies/${companyId}/user`, { headers }),
                fetch(`http://localhost:3000/companies/${companyId}/machines`, { headers }),
                fetch(`http://localhost:3000/companies/${companyId}/machines/ai-analysis`, { headers }),
            ]);
            const [companyData, userData, machineData, aiHistoryData] = await Promise.all([
                companyRes.json(), usersRes.json(), machineRes.json(), aiHistoryRes.json()
            ]);
            setCompany(companyData);
            setUsers(userData?.data || []);
            setMachines(machineData || []);
            setAiHistory(aiHistoryData || []);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchAIHistory = async () => {
        if (!companyId) return;
        setLoadingAI(true);
        try {
            const res = await fetch(`http://localhost:3000/companies/${companyId}/machines/ai-analysis`, {
                headers,
            });
            const data = await res.json();

            const machineIds = machines.map((m) => m._id);
            const filtered = (data || [])
                .map((entry) => ({
                    ...entry,
                    aiAnalysis: (entry.aiAnalysis || []).filter((ai) =>
                        machineIds.includes(ai.machine_id._id)
                    ),
                }))
                .filter((entry) => entry.aiAnalysis.length > 0);

            setAiHistory(filtered);
        } catch (err) {
            console.error('Failed to fetch AI history:', err);
        } finally {
            setLoadingAI(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ai-history') {
            fetchAIHistory();
        }
    }, [activeTab, machines]);

    const handleDeleteUser  = async (id) => {
        try {
            await fetch(`http://localhost:3000/companies/${companyId}/user/${id}`, {
                method: 'DELETE',
                headers,
            });
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleDeleteMachine = async (id) => {
        try {
            await fetch(`http://localhost:3000/companies/${companyId}/machines/${id}`, {
                method: 'DELETE',
                headers,
            });
            setMachines((prev) => prev.filter((m) => m._id !== id));
        } catch (err) {
            alert('Failed to delete machine');
        }
    };

    const filteredUsers = users
        .filter((u) =>
            u.name.toLowerCase().includes(searchUser .toLowerCase())
        )
        .filter((u) => (userSubTab === 'admin' ? u.isAdmin : !u.isAdmin));

    const filteredMachines = machines.filter((m) =>
        m.name?.toLowerCase().includes(searchMachine.toLowerCase())
    );

    const groupByMachine = () => {
        const grouped = {};
        aiHistory.forEach((item) => {
            item.aiAnalysis?.forEach((analysis) => {
                const machineId = analysis.machine_id._id;
                if (!grouped[machineId]) grouped[machineId] = [];
                grouped[machineId].push(analysis);
            });
        });
        return grouped;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleOpenModal = (user = null, machine = null) => {
        setCurrentUser (null);
        setCurrentMachine(null);

        if (user) {
            setCurrentUser (user);
        } else if (machine) {
            setCurrentMachine(machine);
        }

        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentUser (null);
        setCurrentMachine(null);
        setModalOpen(false);
    };

    const handleSaveUser  = async (userData) => {
        try {
            const method = currentUser  ? 'PUT' : 'POST';
            const url = currentUser 
                ? `http://localhost:3000/companies/${companyId}/user/${currentUser ._id}`
                : `http://localhost:3000/companies/${companyId}/user`;

            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            const result = await response.json();
            if (response.ok) {
                setUsers((prev) => {
                    if (currentUser ) {
                        return prev.map((u) => (u._id === currentUser ._id ? data.data : u));
                    }
                    return [...prev, data.data];
                });
                handleCloseModal();
            } else {
                alert(result?.error || 'Failed');
            }
        } catch (err) {
            alert('Error saving data');
        }
    };

    const handleDelete = async (type, id) => {
        try {
            const method = currentMachine ? 'PUT' : 'POST';
            const url = currentMachine
                ? `http://localhost:3000/companies/${companyId}/machines/${currentMachine._id}`
                : `http://localhost:3000/companies/${companyId}/machines`;

            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(machineData),
            });

            const data = await response.json();
            if (response.ok) {
                setMachines((prev) => {
                    if (currentMachine) {
                        return prev.map((m) => (m._id === currentMachine._id ? data.data : m));
                    }
                    return [...prev, data.data];
                });
                handleCloseModal();
            } else {
                setMachines((prev) => prev.filter(m => m._id !== id));
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const renderTable = (data, type) => {
        const displayFields = type === 'user'
            ? ['name', 'email', 'isAdmin', 'isDeveloper']
            : ['name', 'status'];

        return (
            <div className="overflow-x-auto max-w-6xl mx-auto border rounded shadow bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-green-100">
                        <tr>
                            {displayFields.map(key => (
                                <th key={key} className="p-2 text-left capitalize">{key}</th>
                            ))}
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item._id} className="border-b">
                                {displayFields.map(k => (
                                    <td key={k} className="p-2 truncate max-w-xs">{String(item[k])}</td>
                                ))}
                                <td className="p-2 whitespace-nowrap">
                                    <button className="text-blue-600 mr-2" onClick={() => { setModalType(type); setModalData(item); }}>Edit</button>
                                    <button className="text-red-600" onClick={() => handleDelete(type, item._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderUserImage = (user) => {
        if (user.image) {
            // Convert buffer to base64 for display
            const base64String = btoa(
                new Uint8Array(user.image.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            return (
                <img 
                    src={`data:image/jpeg;base64,${base64String}`} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
            );
        }
        return (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm">No Image</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-green-700 text-white p-4">
                <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
                {['company', 'users', 'machines', 'ai-history'].map(tab => (
                    <button
                        key={tab}
                        className={`block w-full text-left px-4 py-2 rounded mb-2 ${activeTab === tab ? 'bg-yellow-400 text-black' : 'hover:bg-green-600'}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
                <button onClick={handleLogout} className="mt-4 text-red-400 hover:text-white">Logout</button>
            </aside>

            <main className="flex-1 p-6">
                {activeTab === 'company' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Company Info</h2>
                        {company ? (
                            <div className="bg-white shadow p-4 rounded max-w-2xl">
                                <p><strong>Name:</strong> {company.name}</p>
                                <p><strong>Description:</strong> {company.description}</p>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-green-800">Staff / Users</h2>
                                    <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded" onClick={() => handleOpenModal()}>
                                        + Add User
                                    </button>
                                </div>
                                <div className="flex gap-4 mb-4">
                                    <button
                                        className={`px-4 py-2 rounded ${userSubTab === 'regular' ? 'bg-green-700 text-white' : 'bg-green-200'
                                            }`}
                                        onClick={() => setUserSubTab('regular')}
                                    >
                                        Regular Staff
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded ${userSubTab === 'admin' ? 'bg-green-700 text-white' : 'bg-green-200'
                                            }`}
                                        onClick={() => setUserSubTab('admin')}
                                    >
                                        Admin Staff
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="mb-4 p-2 border rounded w-full"
                                    value={searchUser }
                                    onChange={(e) => setSearchUser (e.target.value)}
                                />
                                <div className="bg-white rounded shadow">
                                    {filteredUsers.length === 0 ? (
                                        <p className="p-4 text-gray-500">No users found.</p>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-green-100">
                                                <tr>
                                                    <th className="p-2">Name</th>
                                                    <th className="p-2">Email</th>
                                                    <th className="p-2">Admin</th>
                                                    <th className="p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => (
                                                    <tr key={user._id} className="border-t">
                                                        <td className="p-2">{user.name}</td>
                                                        <td className="p-2">{user.email}</td>
                                                        <td className="p-2">{user.isAdmin ? 'Yes' : 'No'}</td>
                                                        <td className="p-2 space-x-2">
                                                            <button className="text-blue-600 hover:underline" onClick={() => handleOpenModal(user)}>Edit</button>
                                                            <button
                                                                className="text-red-600 hover:underline"
                                                                onClick={() => handleDeleteUser (user._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'machines' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-green-800">Machines</h2>
                                    <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded" onClick={() => handleOpenModal(null, {})}>
                                        + Add Machine
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search machines..."
                                    className="mb-4 p-2 border rounded w-full"
                                    value={searchMachine}
                                    onChange={(e) => setSearchMachine(e.target.value)}
                                />
                                <div className="bg-white rounded shadow">
                                    {filteredMachines.length === 0 ? (
                                        <p className="p-4 text-gray-500">No machines found.</p>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-green-100">
                                                <tr>
                                                    <th className="p-2">Name</th>
                                                    <th className="p-2">Status</th>
                                                    <th className="p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMachines.map((machine) => (
                                                    <tr key={machine._id} className="border-t">
                                                        <td className="p-2">{machine.name || 'N/A'}</td>
                                                        <td className="p-2">{machine.status || 'Unknown'}</td>
                                                        <td className="p-2 space-x-2">
                                                            <button className="text-blue-600 hover:underline" onClick={() => handleOpenModal(null, machine)}>Edit</button>
                                                            <button
                                                                className="text-red-600 hover:underline"
                                                                onClick={() => handleDeleteMachine(machine._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                {activeTab === 'ai-history' && (
                    <div>
                        <h2 className="text-2xl font-bold text-green-800 mb-4">AI Analysis History</h2>
                        <div className="flex space-x-4 mb-6">
                            <button
                                className={`px-4 py-2 rounded ${aiSubTab === 'date' ? 'bg-green-700 text-white' : 'bg-green-200'}`}
                                onClick={() => setAiSubTab('date')}
                            >
                                Group by Date
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${aiSubTab === 'machine' ? 'bg-green-700 text-white' : 'bg-green-200'}`}
                                onClick={() => setAiSubTab('machine')}
                            >
                                Group by Machine
                            </button>
                        </div>

                        {loadingAI ? (
                            <p>Loading AI history...</p>
                        ) : aiSubTab === 'date' ? (
                            Object.entries(groupByDate()).map(([date, records]) => (
                                <div key={date} className="mb-4 bg-white p-4 rounded shadow">
                                    <h3 className="font-semibold text-lg text-green-800">{date}</h3>
                                    <ul className="list-disc pl-5 mt-2">
                                        {records.map((item) => (
                                            <li key={item._id}>
                                                <strong>Machine:</strong> {item.machine_id.name} <br />
                                                <strong>Level:</strong> {item.level} <br />
                                                <strong>Notes:</strong> {item.notes}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            Object.entries(groupByMachine()).map(([machineId, records]) => {
                                const machine = machines.find((m) => m._id === machineId);
                                const machineName = machine ? machine.name : 'Unknown Machine';
                                return (
                                    <div key={machineId} className="mb-4 bg-white p-4 rounded shadow">
                                        <h3 className="font-semibold text-lg text-green-800">Machine: {machineName}</h3>
                                        <ul className="list-disc pl-5 mt-2">
                                            {records.map((item) => (
                                                <li key={item._id}>
                                                    <strong>Date:</strong> {new Date(item.createdAt).toLocaleString()} <br />
                                                    <strong>Level:</strong> {item.level} <br />
                                                    <strong>Notes:</strong> {item.notes}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>

            {/* Modal for User */}
            {modalOpen && currentUser  && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">{currentUser  ? 'Edit User' : 'Add User'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const userData = {
                                email: formData.get('email'),
                                name: formData.get('name'),
                                password: formData.get('password'),
                                isAdmin: formData.get('isAdmin') === 'on',
                                isDeveloper: formData.get('isDeveloper') === 'on',
                                socialId: formData.get('socialId'),
                            };
                            handleSaveUser (userData);
                        }}>
                            <input type="text" name="name" placeholder="Name" defaultValue={currentUser ?.name} required className="mb-2 p-2 border rounded w-full" />
                            <input type="email" name="email" placeholder="Email" defaultValue={currentUser ?.email                            } required className="mb-2 p-2 border rounded w-full" />
                            <input type="password" name="password" placeholder="Password" defaultValue={currentUser  ?.password} required className="mb-2 p-2 border rounded w-full" />
                            <label>
                                <input type="checkbox" name="isAdmin" defaultChecked={currentUser  ?.isAdmin} /> Admin
                            </label>
                            <label>
                                <input type="checkbox" name="isDeveloper" defaultChecked={currentUser  ?.isDeveloper} /> Developer
                            </label>
                            <input type="text" name="socialId" placeholder="Social ID" defaultValue={currentUser  ?.socialId} className="mb-2 p-2 border rounded w-full" />
                            <div className="flex justify-end mt-4">
                                <button type="button" className="bg-red-500 text-white px-4 py-2 rounded mr-2" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                                    {currentUser  ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Machine */}
            {modalOpen && currentMachine && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">{currentMachine ? 'Edit Machine' : 'Add Machine'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const machineData = {
                                name: formData.get('name'),
                                status: formData.get('status'),
                            };
                            handleSaveMachine(machineData);
                        }}>
                            <input type="text" name="name" placeholder="Machine Name" defaultValue={currentMachine?.name} required className="mb-2 p-2 border rounded w-full" />
                            <input type="text" name="status" placeholder="Status" defaultValue={currentMachine?.status} className="mb-2 p-2 border rounded w-full" />
                            <div className="flex justify-end mt-4">
                                <button type="button" className="bg-red-500 text-white px-4 py-2 rounded mr-2" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                                    {currentMachine ? 'Update Machine' : 'Add Machine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
