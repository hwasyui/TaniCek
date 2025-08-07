import React, { useState, useEffect, useCallback, useMemo} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EquipmentStatusTable from '../components/EquipmentStatusTable';
import PieChartComponent from '../components/PieChartComponent';
import LogActivityForm from '../components/LogActivityForm';
import ProfileDetailsModal from '../components/ProfileDetailsModal';
import { set } from 'mongoose';

const Dashboard = () => {
    const navigate = useNavigate();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [userName, setUserName] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
    const [showLogActivityModal, setShowLogActivityModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [location, setLocation] = useState({ latitude: null, longitude: null, error: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState('asc'); 
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(loc => ({ ...loc, error: 'Geolocation is not supported by your browser' }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                });
            },
            (err) => {
                setLocation(loc => ({ ...loc, error: err.message }));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!location.latitude || !location.longitude) return;

            try {
                const apiKey = '2458e6496d087230ac1b5a03a0a90d3f';
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;

                const res = await fetch(weatherUrl);
                const weatherJson = await res.json();

                if (!res.ok) throw new Error('Failed to fetch weather');

                const condition = weatherJson.weather?.[0]?.main || 'N/A';
                const description = weatherJson.weather?.[0]?.description || '';
                const iconMap = {
                    Rain: '🌧️',
                    Clouds: '☁️',
                    Clear: '☀️',
                    Snow: '❄️',
                    Thunderstorm: '⛈️',
                    Drizzle: '🌦️',
                    Mist: '🌫️',
                };
                const icon = iconMap[condition] || '🌡️';

                setCurrentWeather({
                    location: weatherJson.name || `Lat ${location.latitude.toFixed(2)}, Lon ${location.longitude.toFixed(2)}`,
                    temperature: weatherJson.main?.temp || 0,
                    condition: condition,
                    humidity: weatherJson.main?.humidity || 0,
                    windSpeed: weatherJson.wind?.speed || 0,
                    aqi: '-',
                    prediction: `Currently ${description}`,
                    icon: icon,
                });
            } catch (err) {
                console.error('Weather fetch error:', err);
            }
        };

        fetchWeather();
    }, [location.latitude, location.longitude]);

    const fetchDashboardData = useCallback(async () => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        const userId = user.id;
        const companyId = user.company;

        setLoading(true);
        setError(null);

        try {
            const [userRes, companyRes, equipmentRes] = await Promise.all([
                fetch(`http://localhost:3000/companies/${companyId}/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:3000/companies/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:3000/companies/${companyId}/machines`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const userJson = await userRes.json();
            const companyJson = await companyRes.json();
            const machines = await equipmentRes.json();

            if (!userRes.ok) throw new Error(userJson.message || 'Failed to fetch user');
            if (!companyRes.ok) throw new Error(companyJson.message || 'Failed to fetch company info');
            if (!equipmentRes.ok) throw new Error(machines.message || 'Failed to fetch equipment data');

            setUserName(userJson.data.name);
            setUserProfile(userJson.data);
            setCompanyInfo(companyJson.data);

            const enrichedMachines = await Promise.all(
                machines.map(async (machine) => {
                    try {
                        const [aiRes, logRes] = await Promise.all([
                            fetch(`http://localhost:3000/companies/${companyId}/machines/${machine._id}/ai-analysis`, {
                                headers: { Authorization: `Bearer ${token}` },
                            }),
                            fetch(`http://localhost:3000/companies/${companyId}/machines/${machine._id}/logs`, {
                                headers: { Authorization: `Bearer ${token}` },
                            }),
                        ]);

                        const aiData = await aiRes.json();
                        const logsData = await logRes.json();

                        const latestAnalysis = Array.isArray(aiData)
                            ? aiData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                            : null;

                        const latestLog = Array.isArray(logsData)
                            ? logsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                            : null;

                        return {
                            ...machine,
                            forecast: latestAnalysis?.aiAnalysis || null,
                            latestLog: latestLog || null,
                            latestLat: latestLog?.location_lat ?? machine.location_lat ?? null,
                            latestLon: latestLog?.location_lon ?? machine.location_lon ?? null,
                        };
                    } catch (err) {
                        console.error(`Error fetching extra info for machine ${machine._id}`, err);
                        return machine;
                    }
                })
            );

            setEquipmentData(enrichedMachines);
            console.log('Dashboard refreshed!', enrichedMachines);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleFormSuccess = () => {
        fetchDashboardData();
        setShowAddEquipmentModal(false);
        setShowLogActivityModal(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getStatusCounts = () => {
        const counts = { High: 0, Medium: 0, Low: 0 };
        equipmentData.forEach(item => {
            if (item.forecast?.level) {
                const level = item.forecast.level.toLowerCase();
                if (level === 'high') counts.High++;
                else if (level === 'medium') counts.Medium++;
                else if (level === 'low') counts.Low++;
            }
        });
        return counts;
    };
    
    const handleSortByName = () => {
        setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    };



    const statusCounts = getStatusCounts();

    const filteredAndSortedEquipment = useMemo(() => {
        let filtered = equipmentData;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by machine type
        if (filterType !== 'All') {
            filtered = filtered.filter(item => item.type === filterType);
        }

        // Filter by machine status
        if (filterStatus !== 'All') {
            filtered = filtered.filter(item =>
                item.forecast?.level?.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        // Sort the data
        filtered.sort((a, b) => {
            if (sortDirection === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

        return filtered;
    }, [equipmentData, searchQuery, filterType, filterStatus, sortDirection]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary-bg dark:bg-dark-primary-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="ml-4 text-text-dark dark:text-text-light">Load to Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-primary-bg dark:bg-dark-primary-bg">
                <p className="text-red-500 mb-4 text-lg">Error: {error}</p>
                <button onClick={handleLogout} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Back to sign in page</button>
            </div>
        );
    }

    const allMachineTypes = ['All', ...new Set(equipmentData.map(item => item.type))];
    const allMachineStatuses = ['All', 'Low', 'Medium', 'High'];

    const renderStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'high':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">High</span>;
            case 'medium':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
            case 'low':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">N/A</span>;
        }
    };

    const renderLogActivity = (log) => {
        if (!log) return 'N/A';
        const logDate = new Date(log.createdAt);
        const now = new Date();
        const diffInHours = Math.floor((now - logDate) / (1000 * 60 * 60));
        return `${diffInHours} h ago`;
    };

    return (
        <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg flex flex-col text-text-dark dark:text-text-light">
            {/* Top Navigation Bar */}
            <nav className="bg-card-bg dark:bg-dark-card-bg shadow-sm p-4 flex justify-between items-center">
                <div className="text-5xl font-bold text-green-500">TaniCek</div>
                <div className="flex items-center space-x-6">
                    <span className="text-text-dark text-lg hidden md:block">Hello, <span className="font-semibold">{userName}</span>!</span>

                    {/* Notification Icon (Placeholder)
                    <button className="text-text-dark dark:text-text-light hover:text-green-500 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {true && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">2</span>}
                    </button> */}

                    {/* User Profile Dropdown / Logout */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 text-text-dark dark:text-text-light hover:text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="hidden md:block">Profile</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border-light rounded-lg shadow-lg opacity-100 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="block w-full text-left px-4 py-2 text-text-dark dark:text-text-light hover:bg-green-400 dark:hover:bg-green-500"
                            >
                            Profile Details
                            </button>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-green-400 dark:hover:bg-green-500">Log Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Show user location if available */}
            <div className="p-4 bg-green-100 text-green-900 text-center">
                {location.error && <p>Location error: {location.error}</p>}
                {location.latitude && location.longitude && (
                    <p>Your location: Lat {location.latitude.toFixed(4)}, Lon {location.longitude.toFixed(4)}</p>
                )}
                {!location.latitude && !location.longitude && !location.error && <p>Obtaining your location...</p>}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card 1: Machine Status Summary */}
                <div className="md:col-span-1 bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-text-dark dark:text-text-light text-center mb-4">Machine Status Summary</h3>
                    <div className="flex items-center justify-center space-x-4">
                        {/* PieChart Components */}
                        <div className="w-36 h-36 flex-shrink-0">
                            <PieChartComponent
                                data={[
                                    { name: 'High', value: statusCounts.High, color: '#F44336' },
                                    { name: 'Medium', value: statusCounts.Medium, color: '#FFC107' },
                                    { name: 'Low', value: statusCounts.Low, color: '#4CAF50' },
                                ]}
                            />
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-lg font-bold text-text-dark dark:text-text-light">Machine Total: {equipmentData.length}</p>
                            <p className="text-md text-green-500">Low: {statusCounts.Low}</p>
                            <p className="text-md text-yellow-500">Medium: {statusCounts.Medium}</p>
                            <p className="text-md text-red-500">High: {statusCounts.High}</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Current Weather Prediction */}
                <div className="md:col-span-1 bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-text-dark dark:text-text-light text-center mb-4">Current Weather Prediction</h3>
                    {currentWeather ? (
                        <div className="space-y-2">
                            <p className="text-4xl text-center mb-2">{currentWeather.icon}</p>
                            <p className="text-lg font-bold text-center">{currentWeather.temperature}°C, {currentWeather.condition}</p>
                            <p className="text-sm text-center text-text-light dark:text-gray-400">{currentWeather.location}</p>
                            <div className="flex justify-around text-sm text-text-light dark:text-gray-400 mt-2">
                                <span>Humidity: {currentWeather.humidity}%</span>
                                <span>Wind: {currentWeather.windSpeed} km/h</span>
                            </div>
                            <p className="text-sm italic mt-4 text-center">{currentWeather.prediction}</p>
                        </div>
                    ) : (
                        <p className="text-center text-text-light dark:text-gray-400 italic">Loading...</p>
                    )}
                </div>

                {/* Card 3: Machines Status & AI Prediction Table*/}
                <div className="md:col-span-3 bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-text-dark dark:text-text-light mb-4">Machine Status & Prediction</h3>
                    <div className="mb-4 flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowLogActivityModal(true)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Add Daily Log</span>
                        </button>
                    </div>

                    <EquipmentStatusTable equipment={equipmentData} />
                </div>
            </main>

                {/* to show log activity modal */}
                {showLogActivityModal && (
                    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-card-bg dark:bg-dark-card-bg p-10 bg-white rounded-lg shadow-2xl max-w-2xl w-full animate-fade-in-up text-text-dark dark:text-text-light relative">
                            <button
                                onClick={() => setShowLogActivityModal(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <LogActivityForm
                                onClose={() => setShowLogActivityModal(false)}
                                onSuccess={handleFormSuccess}
                                machines={equipmentData.map(eq => ({ id: eq._id, name: eq.name }))}
                                latitude={location.latitude}
                                longitude={location.longitude}
                            />

                        </div>
                    </div>
                )}

                {/* to show profile modal */}
                {showProfileModal && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg dark:bg-dark-card-bg p-10 bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in-up text-text-dark dark:text-text-light relative">
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            aria-label="Close"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <ProfileDetailsModal
                        onClose={() => setShowProfileModal(false)}
                        userProfile={userProfile}
                    />
                    </div>
                </div>
                )}
        </div>
    );
};

export default Dashboard;
