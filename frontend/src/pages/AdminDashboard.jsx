import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('company');
    const [aiSubTab, setAiSubTab] = useState('date');
    const [userSubTab, setUserSubTab] = useState('regular');

    const [company, setCompany] = useState(null);
    const [users, setUsers] = useState([]);
    const [machines, setMachines] = useState([]);

    const [aiHistory, setAiHistory] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);

    const [searchUser, setSearchUser] = useState('');
    const [searchMachine, setSearchMachine] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentMachine, setCurrentMachine] = useState(null);

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    const user = storedUser ? JSON.parse(storedUser) : null;
    const companyId = user?.company;
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!user || !token) return navigate('/login');
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [companyRes, usersRes, machineRes] = await Promise.all([
                fetch(`http://localhost:3000/companies/${companyId}`, { headers }),
                fetch(`http://localhost:3000/companies/${companyId}/user`, { headers }),
                fetch(`http://localhost:3000/companies/${companyId}/machines`, { headers }),
            ]);

            const companyData = await companyRes.json();
            const userData = await usersRes.json();
            const machineData = await machineRes.json();

            setCompany(companyData);
            setUsers(userData.data || []);
            setMachines(machineData || []);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
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
                        machineIds.includes(ai.machine_id)
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

    const handleDeleteUser = async (id) => {
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
            u.name.toLowerCase().includes(searchUser.toLowerCase())
        )
        .filter((u) => (userSubTab === 'admin' ? u.isAdmin : !u.isAdmin));

    const filteredMachines = machines.filter((m) =>
        m.name?.toLowerCase().includes(searchMachine.toLowerCase())
    );

    const groupByMachine = () => {
        const grouped = {};
        aiHistory.forEach((entry) => {
            (entry.aiAnalysis || []).forEach((analysis) => {
                if (!grouped[analysis.machine_id]) grouped[analysis.machine_id] = [];
                grouped[analysis.machine_id].push({
                    ...analysis,
                    createdAt: entry.createdAt,
                });
            });
        });
        return grouped;
    };

    const groupByDate = () => {
        const grouped = {};
        aiHistory.forEach((entry) => {
            const date = new Date(entry.createdAt).toLocaleDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(...(entry.aiAnalysis || []));
        });
        return grouped;
    };

    const handleOpenModal = (user = null, machine = null) => {
        setCurrentUser(null);
        setCurrentMachine(null);

        if (user) {
            setCurrentUser(user);
        } else if (machine) {
            setCurrentMachine(machine);
        }

        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentUser(null);
        setCurrentMachine(null);
        setModalOpen(false);
    };

    const handleSaveUser = async (userData) => {
        try {
            const method = currentUser ? 'PUT' : 'POST';
            const url = currentUser
                ? `http://localhost:3000/companies/${companyId}/user/${currentUser._id}`
                : `http://localhost:3000/companies/${companyId}/user`;

            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok) {
                setUsers((prev) => {
                    if (currentUser) {
                        return prev.map((u) => (u._id === currentUser._id ? data.data : u));
                    }
                    return [...prev, data.data];
                });
                handleCloseModal();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to save user');
        }
    };

    const handleSaveMachine = async (machineData) => {
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
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to save machine');
        }
    };

    return (
        <div className="flex min-h-screen bg-green-50">
            {/* Sidebar */}
            <aside className="w-64 bg-green-700 text-white p-4 space-y-4">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                {['company', 'users', 'machines', 'ai-history'].map((tab) => (
                    <button
                        key={tab}
                        className={`block w-full text-left px-4 py-2 rounded ${activeTab === tab ? 'bg-yellow-400 text-black' : 'hover:bg-green-600'
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'ai-history' ? 'AI History' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </aside>

            {/* Content */}
            <main className="flex-1 p-8">
                {loading ? (
                    <p className="text-green-800">Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                        {activeTab === 'company' && (
                            <div>
                                <h2 className="text-2xl font-bold text-green-800 mb-4">Company Info</h2>
                                {company ? (
                                    <div className="bg-white p-6 rounded shadow">
                                        <p><strong>Name:</strong> {company.name}</p>
                                        <p><strong>Description:</strong> {company.description}</p>
                                    </div>
                                ) : (
                                    <p>No company info available.</p>
                                )}
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
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
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
                                                                onClick={() => handleDeleteUser(user._id)}
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
                                        className={`px-4 py-2 rounded ${aiSubTab === 'date' ? 'bg-green-700 text-white' : 'bg-green-200'
                                            }`}
                                        onClick={() => setAiSubTab('date')}
                                    >
                                        Group by Date
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded ${aiSubTab === 'machine' ? 'bg-green-700 text-white' : 'bg-green-200'
                                            }`}
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
                                                        <strong>Machine:</strong> {item.machine_id} <br />
                                                        <strong>Level:</strong> {item.level} <br />
                                                        <strong>Notes:</strong> {item.notes}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    Object.entries(groupByMachine()).map(([machineId, records]) => {
                                        const machineName = machines.find((m) => m._id === machineId)?.name || machineId;
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
                    </>
                )}
            </main>

            {/* Modal for User */}
            {modalOpen && currentUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">{currentUser ? 'Edit User' : 'Add User'}</h2>
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
                            handleSaveUser(userData);
                        }}>
                            <input type="text" name="name" placeholder="Name" defaultValue={currentUser?.name} required className="mb-2 p-2 border rounded w-full" />
                            <input type="email" name="email" placeholder="Email" defaultValue={currentUser?.email} required className="mb-2 p-2 border rounded w-full" />
                            <input type="password" name="password" placeholder="Password" defaultValue={currentUser?.password} required className="mb-2 p-2 border rounded w-full" />
                            <label>
                                <input type="checkbox" name="isAdmin" defaultChecked={currentUser?.isAdmin} /> Admin
                            </label>
                            <label>
                                <input type="checkbox" name="isDeveloper" defaultChecked={currentUser?.isDeveloper} /> Developer
                            </label>
                            <input type="text" name="socialId" placeholder="Social ID" defaultValue={currentUser?.socialId} className="mb-2 p-2 border rounded w-full" />
                            <div className="flex justify-end mt-4">
                                <button type="button" className="bg-red-500 text-white px-4 py-2 rounded mr-2" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                                    {currentUser ? 'Update User' : 'Add User'}
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
