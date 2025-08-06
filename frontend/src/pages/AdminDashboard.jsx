import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    // const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const [activeTab, setActiveTab] = useState('company');
    const [aiSubTab, setAiSubTab] = useState('date');
    const [userSubTab, setUserSubTab] = useState('regular');

    const [showSidebar, setShowSidebar] = useState(false);
    const [machineTypes, setMachineTypes] = useState([]); // array of types
    const [selectedMachineType, setSelectedMachineType] = useState(''); // selected value for dropdown
    const [customMachineType, setCustomMachineType] = useState(''); // for 'Others' input

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
    const [modalType, setModalType] = useState(''); // 'user' or 'machine'
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentMachine, setCurrentMachine] = useState(null);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', item: null });

    // State for password validation in user modal
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordError, setShowPasswordError] = useState(false);

    // Camera and image states
    // const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    const user = storedUser ? JSON.parse(storedUser) : null;
    const companyId = user?.company;
    const headers = { Authorization: `Bearer ${token}` };

const allMachineTypes = [...new Set((Array.isArray(machines) ? machines : []).filter(item => item && item.type).map(item => item.type)), 'Others'];


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
                    ai.machine_id && machineIds.includes(ai.machine_id._id)
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

    // Show confirmation dialog before deleting user
    const handleDeleteUser = (id) => {
        const user = users.find(u => u._id === id);
        setConfirmDialog({ open: true, type: 'user', item: user });
    };

    // Show confirmation dialog before deleting machine
    const handleDeleteMachine = (id) => {
        const machine = machines.find(m => m._id === id);
        setConfirmDialog({ open: true, type: 'machine', item: machine });
    };

    // Confirmed delete action
    const confirmDelete = async () => {
        if (confirmDialog.type === 'user' && confirmDialog.item) {
            try {
                await fetch(`http://localhost:3000/companies/${companyId}/user/${confirmDialog.item._id}`, {
                    method: 'DELETE',
                    headers,
                });
                setUsers((prev) => prev.filter((u) => u._id !== confirmDialog.item._id));
            } catch (err) {
                alert('Failed to delete user');
            }
        } else if (confirmDialog.type === 'machine' && confirmDialog.item) {
            try {
                await fetch(`http://localhost:3000/companies/${companyId}/machines/${confirmDialog.item._id}`, {
                    method: 'DELETE',
                    headers,
                });
                setMachines((prev) => prev.filter((m) => m._id !== confirmDialog.item._id));
            } catch (err) {
                alert('Failed to delete machine');
            }
        }
        setConfirmDialog({ open: false, type: '', item: null });
    };

    // Cancel delete
    const cancelDelete = () => {
        setConfirmDialog({ open: false, type: '', item: null });
    };

    const filteredUsers = users
        .filter((u) =>
            u.name.toLowerCase().includes(searchUser.toLowerCase())
        )
        .filter((u) => (userSubTab === 'admin' ? u.isAdmin : !u.isAdmin));

const filteredMachines = (Array.isArray(machines) ? machines : [])
    .filter((m) => m && m.name && typeof m.name === 'string')
    .filter((m) => m.name.toLowerCase().includes(searchMachine.toLowerCase()));

    const groupByMachine = () => {
        const grouped = {};
        aiHistory.forEach((entry) => {
            (entry.aiAnalysis || []).forEach((analysis) => {
                const machineId = analysis.machine_id._id;
                if (!grouped[machineId]) grouped[machineId] = [];
                grouped[machineId].push({
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

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setIsEditing(!!item);

        if (type === 'user') {
            setCurrentUser(item);
            setCurrentMachine(null);
        } else if (type === 'machine') {
            setCurrentMachine(item);
            setCurrentUser(null);
            // Set selectedMachineType for edit or add
            if (item && allMachineTypes.includes(item.type)) {
                setSelectedMachineType(item.type);
                setCustomMachineType('');
            } else if (item && item.type) {
                setSelectedMachineType('Others');
                setCustomMachineType(item.type);
            } else {
                setSelectedMachineType('');
                setCustomMachineType('');
            }
        }

        // Reset image states
        setCapturedImage(null);
        setSelectedImage(null);
        // setShowCamera(false);

        // Reset password modal states
        setPassword('');
        setConfirmPassword('');
        setShowPasswordError(false);

        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentUser(null);
        setCurrentMachine(null);
        setModalOpen(false);
        setModalType('');
        setIsEditing(false);
        setSelectedMachineType('');
        setCustomMachineType('');

        // Reset image states
        setCapturedImage(null);
        setSelectedImage(null);
        // setShowCamera(false);

        // Stop camera if running
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Camera functions
//     const startCamera = async () => {
//     try {
//         if (cameraStream) {
//             cameraStream.getTracks().forEach(track => track.stop());
//         }

//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         setCameraStream(stream);
//         setShowCamera(true);
//         if (videoRef.current) {
//             videoRef.current.srcObject = stream;
//         }
//     } catch (err) {
//         alert('Failed to access camera');
//         setShowCamera(false);
//         setCameraStream(null);
//     }
// };


    // const capturePhoto = () => {
    //     if (videoRef.current && canvasRef.current) {
    //         const canvas = canvasRef.current;
    //         const video = videoRef.current;
    //         const context = canvas.getContext('2d');
            
    //         canvas.width = video.videoWidth;
    //         canvas.height = video.videoHeight;
    //         context.drawImage(video, 0, 0);
            
    //         canvas.toBlob((blob) => {
    //             setCapturedImage(blob);
    //             setSelectedImage(null);
    //             setShowCamera(false);
                
    //             // Stop camera
    //             if (cameraStream) {
    //                 cameraStream.getTracks().forEach(track => track.stop());
    //                 setCameraStream(null);
    //             }
    //         }, 'image/jpeg', 0.8);
    //     }
    // };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setCapturedImage(null);
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('isAdmin', userData.isAdmin);
            
            // Add image if available
            if (capturedImage) {
                formData.append('image', capturedImage, 'photo.jpg');
            } else if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:3000/companies/${companyId}/user/${currentUser._id}`
                : `http://localhost:3000/companies/${companyId}/user`;

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setUsers((prev) => {
                    if (isEditing) {
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
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:3000/companies/${companyId}/machines/${currentMachine._id}`
                : `http://localhost:3000/companies/${companyId}/machines`;

            // Use custom type if 'Others' selected
            const typeToSave = selectedMachineType === 'Others' ? customMachineType : selectedMachineType;
            const payload = { ...machineData, type: typeToSave };

            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                await fetchData(); // reload latest machines and types
                setSelectedMachineType('');
                setCustomMachineType('');
                handleCloseModal();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to save machine');
        }
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
        <div className="flex min-h-screen bg-green-50">
            {/* Sidebar Responsive */}
            {/* Mobile sidebar overlay */}
            {showSidebar && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 sm:hidden" onClick={() => setShowSidebar(false)}></div>
            )}
            <nav className={`bg-green-700 text-white p-4 space-y-4 w-full sm:w-64 sm:min-h-screen flex flex-col sm:block ${showSidebar ? 'fixed z-50 top-0 left-0 h-full' : 'fixed sm:static z-40 top-0 left-0 h-16 sm:h-auto'} sm:relative`}>
                <div className="flex items-center justify-between sm:block">
                    <h1 className="text-xl sm:text-2xl font-bold mb-0 sm:mb-6">Admin Dashboard</h1>
                    {/* Mobile menu toggle */}
                    <button className="sm:hidden p-2 focus:outline-none" onClick={() => setShowSidebar((prev) => !prev)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                {/* Sidebar menu */}
                <div className={`sm:block ${showSidebar ? 'block' : 'hidden'} sm:mt-0 mt-4`}>
                    {['company', 'users', 'machines', 'ai-history'].map((tab) => (
                        <button
                            key={tab}
                            className={`block w-full text-left px-4 py-2 rounded font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2 ${activeTab === tab ? 'bg-yellow-400 text-black scale-105' : 'hover:bg-green-600'}`}
                            onClick={() => { setActiveTab(tab); if (window.innerWidth < 640) setShowSidebar(false); }}
                        >
                            {tab === 'ai-history' ? 'AI History' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-green-100 dark:hover:bg-green-500 font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400">Log Out</button>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-green-800 text-lg">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-red-600 text-lg">{error}</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Company Info */}
                        {activeTab === 'company' && (
                            <div className="w-full max-w-2xl mx-auto">
                                <h2 className="text-2xl font-bold text-green-800 mb-4">Company Info</h2>
                                {company ? (
                                    <div className="bg-white p-6 rounded shadow flex flex-col gap-2">
                                        <p className="text-base sm:text-lg"><strong>Name:</strong> {company.name}</p>
                                        <p className="text-base sm:text-lg"><strong>Description:</strong> {company.description}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No company info available.</p>
                                )}
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="w-full max-w-full">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 px-2 sm:px-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-800 flex items-center gap-2">
                                        <svg className="w-6 sm:w-7 h-6 sm:h-7 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M3 20h5v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
                                        Staff / Users
                                    </h2>
                                    <button 
                                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded shadow-lg font-semibold flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-auto justify-center"
                                        onClick={() => handleOpenModal('user')}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Add User
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 px-2 sm:px-0">
                                    <button
                                        className={`px-4 py-2 rounded font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2 w-full sm:w-auto justify-center ${userSubTab === 'regular' ? 'bg-green-700 text-white scale-105' : 'bg-green-200 text-green-800 hover:bg-green-300 hover:scale-105'}`}
                                        onClick={() => setUserSubTab('regular')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        Regular Staff
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2 w-full sm:w-auto justify-center ${userSubTab === 'admin' ? 'bg-green-700 text-white scale-105' : 'bg-green-200 text-green-800 hover:bg-green-300 hover:scale-105'}`}
                                        onClick={() => setUserSubTab('admin')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0" /></svg>
                                        Admin Staff
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="mb-4 p-2 border rounded w-full max-w-full sm:max-w-xs"
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                />
                                <div className="bg-white rounded shadow overflow-x-auto max-w-full">
                                    {filteredUsers.length === 0 ? (
                                        <p className="p-4 text-gray-500">No users found.</p>
                                    ) : (
                                        <div className="w-full min-w-[320px] max-w-full overflow-x-auto">
                                            <table className="w-full text-left text-xs sm:text-sm md:text-base">
                                                <thead className="bg-green-100">
                                                    <tr>
                                                        <th className="p-2 whitespace-nowrap">Image</th>
                                                        <th className="p-2 whitespace-nowrap">Name</th>
                                                        <th className="p-2 whitespace-nowrap">Email</th>
                                                        <th className="p-2 whitespace-nowrap">Admin</th>
                                                        <th className="p-2 whitespace-nowrap">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredUsers.map((user) => (
                                                        <tr key={user._id} className="border-t">
                                                            <td className="p-2 min-w-[56px] max-w-[56px]">
                                                                {renderUserImage(user)}
                                                            </td>
                                                            <td className="p-2 break-words max-w-[120px]">{user.name}</td>
                                                            <td className="p-2 break-words max-w-[160px]">{user.email}</td>
                                                            <td className="p-2">{user.isAdmin ? 'Yes' : 'No'}</td>
                                                            <td className="p-2 flex flex-col sm:flex-row gap-2">
                                                                <button
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 w-full sm:w-auto justify-center"
                                                                    onClick={() => handleOpenModal('user', user)}
                                                                    title="Edit User"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z" /></svg>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-150 w-full sm:w-auto justify-center"
                                                                    onClick={() => handleDeleteUser(user._id)}
                                                                    title="Delete User"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Machines Tab */}
                        {activeTab === 'machines' && (
                            <div className="w-full max-w-full">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 px-2 sm:px-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-800">Machines</h2>
                                    <button 
                                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded shadow-lg font-semibold flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-auto justify-center"
                                        onClick={() => handleOpenModal('machine')}
                                    >
                                        + Add Machine
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search machines..."
                                    className="mb-4 p-2 border rounded w-full max-w-full sm:max-w-xs"
                                    value={searchMachine}
                                    onChange={(e) => setSearchMachine(e.target.value)}
                                />
                                <div className="bg-white rounded shadow overflow-x-auto max-w-full">
                                    {filteredMachines.length === 0 ? (
                                        <p className="p-4 text-gray-500">No machines found.</p>
                                    ) : (
                                        <div className="w-full min-w-[320px] max-w-full overflow-x-auto">
                                            <table className="w-full text-left text-xs sm:text-sm md:text-base">
                                                <thead className="bg-green-100">
                                                    <tr>
                                                        <th className="p-2 whitespace-nowrap">Name</th>
                                                        {/* <th className="p-2">Status</th> */}
                                                        <th className="p-2 whitespace-nowrap">Type</th>
                                                        <th className="p-2 whitespace-nowrap">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredMachines.map((machine) => (
                                                        <tr key={machine._id} className="border-t">
                                                            <td className="p-2 break-words max-w-[120px]">{machine.name || 'N/A'}</td>
                                                            <td className="p-2 break-words max-w-[120px]">{machine.type || 'Unknown'}</td>
                                                            <td className="p-2 flex flex-col sm:flex-row gap-2">
                                                                <button
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 w-full sm:w-auto justify-center"
                                                                    onClick={() => handleOpenModal('machine', machine)}
                                                                    title="Edit Machine"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z" /></svg>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-150 w-full sm:w-auto justify-center"
                                                                    onClick={() => handleDeleteMachine(machine._id)}
                                                                    title="Delete Machine"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AI History Tab */}
                        {activeTab === 'ai-history' && (
                            <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
                                <h2 className="text-2xl font-bold text-green-800 mb-4">AI Analysis History</h2>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
                                    <button
                                        className={`px-4 py-2 rounded font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-auto ${aiSubTab === 'date' ? 'bg-green-700 text-white scale-105' : 'bg-green-200 text-green-800 hover:bg-green-300 hover:scale-105'}`}
                                        onClick={() => setAiSubTab('date')}
                                    >
                                        Group by Date
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-auto ${aiSubTab === 'machine' ? 'bg-green-700 text-white scale-105' : 'bg-green-200 text-green-800 hover:bg-green-300 hover:scale-105'}`}
                                        onClick={() => setAiSubTab('machine')}
                                    >
                                        Group by Machine
                                    </button>
                                </div>

                                {loadingAI ? (
                                    <div className="flex justify-center items-center h-32">
                                        <p className="text-green-800 text-lg">Loading AI history...</p>
                                    </div>
                                ) : aiSubTab === 'date' ? (
                                    <div className="flex flex-col gap-4">
                                        {Object.entries(groupByDate()).map(([date, records]) => (
                                            <div key={date} className="bg-white rounded shadow p-4 flex flex-col gap-2 w-full">
                                                <h3 className="font-semibold text-lg text-green-800 mb-2">{date}</h3>
                                                <div className="flex flex-col gap-2">
                                                    {records.map((item) => (
                                                        <div key={item._id} className="border rounded p-3 flex flex-row flex-wrap items-center gap-4 bg-green-50 hover:bg-green-100 transition-all">
                                                            <span className="block text-sm sm:text-base font-semibold text-green-700 min-w-[120px]"><strong>Machine:</strong> {item.machine_id.name}</span>
                                                            <span className="block text-sm sm:text-base min-w-[80px]"><strong>Level:</strong> {item.level}</span>
                                                            <span className="block text-sm sm:text-base min-w-[120px]"><strong>Notes:</strong> {item.notes}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {Object.entries(groupByMachine()).map(([machineId, records]) => {
                                            const machine = machines.find((m) => m._id === machineId);
                                            const machineName = machine ? machine.name : 'Unknown Machine';
                                            return (
                                                <div key={machineId} className="bg-white rounded shadow p-4 flex flex-col gap-2 w-full">
                                                    <h3 className="font-semibold text-lg text-green-800 mb-2">Machine: {machineName}</h3>
                                                    <div className="flex flex-col gap-2">
                                                        {records.map((item) => (
                                                            <div key={item._id} className="border rounded p-3 flex flex-row flex-wrap items-center gap-4 bg-green-50 hover:bg-green-100 transition-all">
                                                                <span className="block text-sm sm:text-base font-semibold text-green-700 min-w-[140px]"><strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}</span>
                                                                <span className="block text-sm sm:text-base min-w-[80px]"><strong>Level:</strong> {item.level}</span>
                                                                <span className="block text-sm sm:text-base min-w-[120px]"><strong>Notes:</strong> {item.notes}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal for User */}

            {modalOpen && modalType === 'user' && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-0 sm:p-6 rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto transition-all duration-300">
                        <h2 className="text-2xl font-bold mb-4 text-center text-green-800">
                            {isEditing ? 'Edit User' : 'Add User'}
                        </h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (password !== confirmPassword) {
                                    setShowPasswordError(true);
                                    return;
                                }
                                setShowPasswordError(false);
                                const formData = new FormData(e.target);
                                const userData = {
                                    email: formData.get('email'),
                                    name: formData.get('name'),
                                    password,
                                    isAdmin: formData.get('isAdmin') === 'on',
                                };
                                handleSaveUser(userData);
                            }}
                        >
                            <div className="flex flex-col gap-4 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                        <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            id="name"
                                            placeholder="Name" 
                                            defaultValue={currentUser?.name || ''} 
                                            required 
                                            className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            id="email"
                                            placeholder="Email" 
                                            defaultValue={currentUser?.email || ''} 
                                            required 
                                            className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                        <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            id="password"
                                            placeholder="Password" 
                                            required 
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setShowPasswordError(false); }}
                                            className={`p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all ${showPasswordError ? 'border-red-500 bg-red-50' : ''}`}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword" 
                                            id="confirmPassword"
                                            placeholder="Confirm Password" 
                                            required 
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setShowPasswordError(false); }}
                                            className={`p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all ${showPasswordError ? 'border-red-500 bg-red-50' : ''}`}
                                        />
                                    </div>
                                </div>
                                {showPasswordError && (
                                    <div className="text-red-600 text-sm font-semibold mt-1 text-center animate-pulse">Password dan Confirm Password harus sama!</div>
                                )}
                                <label className="flex items-center gap-2 mt-2">
                                    <input 
                                        type="checkbox" 
                                        name="isAdmin" 
                                        defaultChecked={currentUser?.isAdmin || false} 
                                        className="mr-2 accent-green-700 focus:ring-2 focus:ring-green-400"
                                    /> 
                                    <span className="font-medium">Admin</span>
                                </label>
                            </div>
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-green-800">User Image</h3>
                                {/* Current image preview */}
                                {isEditing && currentUser?.image && !capturedImage && !selectedImage && (
                                    <div className="mb-2 flex flex-col items-center">
                                        <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                                        {renderUserImage(currentUser)}
                                    </div>
                                )}
                                {/* New image preview */}
                                {(capturedImage || selectedImage) && (
                                    <div className="mb-2 flex flex-col items-center">
                                        <p className="text-sm text-gray-600 mb-1">New Image:</p>
                                        <img 
                                            src={capturedImage ? URL.createObjectURL(capturedImage) : URL.createObjectURL(selectedImage)}
                                            alt="New user image"
                                            className="w-20 h-20 rounded-full object-cover border-2 border-green-400 shadow-md"
                                        />
                                    </div>
                                )}
                                {/* Image input options */}
                                <div className="flex gap-2 mb-2 justify-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                    >
                                        Upload Image
                                    </button>
                                </div>
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" 
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                                >
                                    {isEditing ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Machine */}

            {modalOpen && modalType === 'machine' && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-0 sm:p-6 rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto transition-all duration-300">
                        <h2 className="text-2xl font-bold mb-4 text-center text-green-800">
                            {isEditing ? 'Edit Machine' : 'Add Machine'}
                        </h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const machineData = {
                                name: formData.get('name'),
                                status: formData.get('status'),
                            };
                            handleSaveMachine(machineData);
                        }}>
                            <div className="flex flex-col gap-4 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                        <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Machine Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            id="name"
                                            placeholder="Machine Name" 
                                            defaultValue={currentMachine?.name || ''} 
                                            required 
                                            className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1">Machine Type</label>
                                        <select
                                            name="type"
                                            id="type"
                                            className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
                                            value={selectedMachineType}
                                            onChange={(e) => setSelectedMachineType(e.target.value)}
                                        >
                                            <option value="" disabled>Select Machine Type</option>
                                            {allMachineTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {/* Show input for custom type if 'Others' selected */}
                                        {selectedMachineType === 'Others' && (
                                            <input
                                                type="text"
                                                name="customType"
                                                id="customType"
                                                placeholder="Input machine type"
                                                value={customMachineType}
                                                onChange={(e) => setCustomMachineType(e.target.value)}
                                                className="mt-2 p-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" 
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                                >
                                    {isEditing ? 'Update Machine' : 'Add Machine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        {/* Confirmation Dialog for Delete */}
        {confirmDialog.open && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                    <h2 className="text-xl font-bold text-center text-red-700 mb-4">Delete Confirmation</h2>
                    <p className="text-center text-gray-700 mb-6">
                        Are you sure to delete {confirmDialog.type === 'user' ? 'user' : 'machine'} <span className="font-semibold">{confirmDialog.item?.name || confirmDialog.item?.email}</span>?<br />This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                            onClick={cancelDelete}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                            onClick={confirmDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}