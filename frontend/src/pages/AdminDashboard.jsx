import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('company');
    const [users, setUsers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [company, setCompany] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [aiHistory, setAiHistory] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiSubTab, setAiSubTab] = useState('date');

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user = storedUser ? JSON.parse(storedUser) : null;
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

    const groupByDate = () => {
        const grouped = {};
        aiHistory.forEach((item) => {
            item.aiAnalysis?.forEach((analysis) => {
                const date = new Date(analysis.createdAt).toLocaleDateString();
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(analysis);
            });
        });
        return grouped;
    };

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

    const handleSave = async (data) => {
        const isUser = modalType === 'user';
        const isEdit = modalData?._id;

        if (isUser && !isEdit) {
            if (!data.password || !data.confirmPassword) {
                return alert('Password and Confirm Password are required');
            }
            if (data.password !== data.confirmPassword) {
                return alert('Passwords do not match');
            }
        }

        const url = `http://localhost:3000/companies/${companyId}/${isUser ? 'user' : 'machines'}${isEdit ? `/${modalData._id}` : ''}`;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const payload = { ...data };
            delete payload.confirmPassword;

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.ok) {
                if (isUser) {
                    setUsers((prev) =>
                        isEdit ? prev.map(u => u._id === result.data._id ? result.data : u) : [...prev, result.data]
                    );
                } else {
                    setMachines((prev) =>
                        isEdit ? prev.map(m => m._id === result.data._id ? result.data : m) : [...prev, result.data]
                    );
                }
                setModalType(null);
                setModalData(null);
            } else {
                alert(result?.error || 'Failed');
            }
        } catch (err) {
            alert('Error saving data');
        }
    };

    const handleDelete = async (type, id) => {
        try {
            await fetch(`http://localhost:3000/companies/${companyId}/${type}/${id}`, {
                method: 'DELETE',
                headers
            });
            if (type === 'user') {
                setUsers((prev) => prev.filter(u => u._id !== id));
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
                        ) : <p>Loading company info...</p>}
                    </div>
                )}

                {['users', 'machines'].includes(activeTab) && (
                    <div>
                        <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold">{activeTab === 'users' ? 'Users' : 'Machines'}</h2>
                            <button
                                className="bg-yellow-400 px-4 py-2 rounded"
                                onClick={() => { setModalType(activeTab.slice(0, -1)); setModalData(null); }}
                            >
                                + Add {activeTab === 'users' ? 'User' : 'Machine'}
                            </button>
                        </div>
                        {renderTable(activeTab === 'users' ? users : machines, activeTab.slice(0, -1))}
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

            {modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="text-lg font-bold mb-4">{modalData ? 'Edit' : 'Add'} {modalType}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = new FormData(e.target);
                            const data = Object.fromEntries(form.entries());
                            if (modalType === 'user') {
                                data.isAdmin = form.get('isAdmin') === 'on';
                                data.isDeveloper = form.get('isDeveloper') === 'on';
                            }
                            handleSave(data);
                        }}>
                            {modalType === 'user' && (
                                <>
                                    <input name="name" defaultValue={modalData?.name} placeholder="Name" required className="w-full p-2 border mb-2" />
                                    <input name="email" defaultValue={modalData?.email} placeholder="Email" required type="email" className="w-full p-2 border mb-2" />
                                    <input name="password" placeholder="Password" type="password" className="w-full p-2 border mb-2" />
                                    {!modalData && (
                                        <input name="confirmPassword" placeholder="Confirm Password" type="password" className="w-full p-2 border mb-2" required />
                                    )}
                                    <label className="block mb-1"><input type="checkbox" name="isAdmin" defaultChecked={modalData?.isAdmin} /> Admin</label>
                                    <label className="block mb-1"><input type="checkbox" name="isDeveloper" defaultChecked={modalData?.isDeveloper} /> Developer</label>
                                </>
                            )}
                            {modalType === 'machine' && (
                                <>
                                    <input name="name" defaultValue={modalData?.name} placeholder="Machine Name" required className="w-full p-2 border mb-2" />
                                    <input name="status" defaultValue={modalData?.status} placeholder="Status" className="w-full p-2 border mb-2" />
                                </>
                            )}
                            <div className="flex justify-end mt-4">
                                <button type="button" onClick={() => { setModalType(null); setModalData(null); }} className="mr-2 px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}



