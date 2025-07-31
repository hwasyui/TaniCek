import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EquipmentStatusTable from '../components/EquipmentStatusTable';
import PieChartComponent from '../components/PieChartComponent';
import AddEquipmentForm from '../components/AddEquipmentForm';
import LogActivityForm from '../components/LogActivityForm';
import { checkAuthStatus, fetchAllMachinesWithForecasts } from '../api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Petani Cerdas');
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false); 
    const [showLogActivityModal, setShowLogActivityModal] = useState(false);
    const [currentWeather, setCurrentWeather] = useState(null);

    // useCallback to memoize the function and prevent unnecessary re-renders
    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // --- AUTH CHECK ---
            // Implement your actual Express API call to check authentication status.
            // const authResponse = await checkAuthStatus();
            // if (!authResponse.isAuthenticated) {
            //    navigate('/login');
            //    return;
            // }
            // setUserName(authResponse.user.name || authResponse.user.email.split('@')[0]);

            // --- FETCH EQUIPMENT DATA WITH FORECASTS ---
            // const machinesResponse = await fetchAllMachinesWithForecasts();
            // if (!machinesResponse.success) {
            //    throw new Error(machinesResponse.message || 'Gagal memuat data alat.');
            // }
            // setEquipmentData(machinesResponse.data);

            // --- SIMULATED DATA FOR DEVELOPMENT ---
            setTimeout(() => {
                const dummyAuthUser = { name: 'Ali', email: 'ali@gmail.com' };
                setUserName(dummyAuthUser.name || dummyAuthUser.email.split('@')[0]);
                const dummyData = [
                    { id: 'machine-1', name: 'Generator', type: 'Generator', location_lat: 1.0, location_lon: 104.0, lastLogDate: '2025-07-26', forecast: { is_dangerous: false, level: 'Low', reason: 'Normal condition' } },
                    { id: 'machine-2', name: 'Irrigation Pump A', type: 'Water Pump', location_lat: 1.1, location_lon: 104.1, lastLogDate: '2025-07-27', forecast: { is_dangerous: true, level: 'High', reason: 'Abnormal vibration levels, indicating worn bearings. Immediate inspection required' } },
                    { id: 'machine-3', name: 'tractor', type: 'tractor', location_lat: 1.2, location_lon: 104.2, lastLogDate: '2025-07-25', forecast: { is_dangerous: false, level: 'Low', reason: 'Optimal Condition' } },
                    { id: 'machine-4', name: 'HVAC Storage Warehouse', type: 'HVAC', location_lat: 1.3, location_lon: 104.3, lastLogDate: '2025-07-27', forecast: { is_dangerous: false, level: 'Low', reason: 'Stable temperature, humidity maintained' } },
                    { id: 'machine-5', name: 'Rice Threshing Machine', type: 'Others', location_lat: 1.4, location_lon: 104.4, lastLogDate: '2025-07-27', forecast: { is_dangerous: true, level: 'High', reason: 'There is an unusual noise from the transmission, and the brake pads are severely worn' } },
                    { id: 'machine-6', name: 'Automatic Sprayer', type: 'Sprayer', location_lat: 1.5, location_lon: 104.5, lastLogDate: '2025-07-26', forecast: { is_dangerous: false, level: 'Low', reason: 'Normal pressure, no leaks' } },
                    { id: 'machine-7', name: 'Field', type: 'Field', location_lat: 1.6, location_lon: 104.6, lastLogDate: '2025-07-26', forecast: { is_dangerous: false, level: 'Low', reason: 'Good soil and nutrient conditions' } },
                    { id: 'machine-8', name: 'Deep Well Water Pump', type: 'Water Pump', location_lat: 1.7, location_lon: 104.7, lastLogDate: '2025-07-27', forecast: { is_dangerous: false, level: 'Low', reason: 'Water flow is stable.' } },
                    { id: 'machine-9', name: 'Harvest Drying Machine', type: 'Others', location_lat: 1.8, location_lon: 104.8, lastLogDate: '2025-07-27', forecast: { is_dangerous: true, level: 'Medium', reason: 'Dirty air filter, efficiency decreasing. Needs replacement' } },
                ];
                setEquipmentData(dummyData);

                setCurrentWeather({
                    location: 'Cikarang, Indonesia',
                    temperature: 32,
                    condition: 'Sunny',
                    humidity: 63,
                    windSpeed: 8,
                    aqi: 3, // AQI 1-5
                    prediction: 'The weather is sunny and humid, with a chance of light rain in the afternoon. There is no significant impact on the equipment',
                    icon: '☀️'
                });

                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
            setLoading(false);
        }
    }, [navigate]); 

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]); 

    const handleLogout = async () => {
        navigate('/login');
    };

    const getStatusCounts = () => {
        const counts = { High: 0, Medium: 0, Low: 0 };
        equipmentData.forEach(item => {
            if (item.forecast && item.forecast.level) {
                counts[item.forecast.level]++;
            }
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    const handleFormSuccess = () => {
        loadDashboardData(); 
        setShowAddEquipmentModal(false);
        setShowLogActivityModal(false);
    };

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

    return (
        <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg flex flex-col text-text-dark dark:text-text-light">
            {/* Top Navigation Bar */}
            <nav className="bg-card-bg dark:bg-dark-card-bg shadow-sm p-4 flex justify-between items-center">
                <div className="text-5xl font-bold text-green-500">TaniCek</div>
                <div className="flex items-center space-x-6">
                    <span className="text-text-dark text-lg hidden md:block">Halo, <span className="font-semibold">{userName}</span>!</span>

                    {/* Notification Icon (Placeholder) */}
                    <button className="text-text-dark dark:text-text-light hover:text-green-500 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {true && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">2</span>}
                    </button>

                    {/* User Profile Dropdown / Logout */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 text-text-dark dark:text-text-light hover:text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="hidden md:block">Profile</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border-light rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <Link to="/profile" className="block px-4 py-2 text-text-dark dark:text-text-light hover:bg-green-100 dark:hover:bg-green-500">Profile Settings</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-green-100 dark:hover:bg-green-500">Log Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Machine Status Summary */}
                <div className="md:col-span-1 bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-text-dark dark:text-text-light text-center mb-4">Machine Status Summary</h3>
                    <div className="w-full h-48 flex items-center justify-center">
                        <PieChartComponent
                            data={[
                                { name: 'High', value: statusCounts.High, color: '#F44336' },
                                { name: 'Medium', value: statusCounts.Medium, color: '#FFC107' },
                                { name: 'Low', value: statusCounts.Low, color: '#4CAF50' },
                            ]}
                        />
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-lg font-bold text-text-dark dark:text-text-light mb-2">Machine Total: {equipmentData.length}</p>
                        <p className="text-md text-black-500">Low: {statusCounts.Low}</p>
                        <p className="text-md text-black-500">Medium: {statusCounts.Medium}</p>
                        <p className="text-md text-black-500">High: {statusCounts.High}</p>
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

                {/* Card 3: Current Reminder*/}
                <div className="md:col-span-1 bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md flex flex-col">
                    <h3 className="text-xl font-semibold text-text-dark dark:text-text-light mb-4">Current Reminder</h3>
                    <div className="flex-1 space-y-3">

                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md dark:bg-white-900 dark:border-blue-700">
                            <p className="font-semibold text-blue-500 dark:text-blue-300 text-sm">Change the oil in the main generator set</p>
                            <p className="text-xs text-text-light dark:text-gray-400">Due date: 05 August 2025</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md dark:bg-white-900 dark:border-yellow-700">
                            <p className="font-semibold text-yellow-600 dark:text-yellow-300 text-sm">Check the Air Filter of the Rice Threshing Machine</p>
                            <p className="text-xs text-text-light dark:text-gray-400">Expected to be cleaned this week</p>
                        </div>
                        {false && <p className="text-center text-text-light dark:text-text-light italic mt-8">There are no current reminders. You can add the reminder manually</p>}
                    </div>
                    <button
                        onClick={() => alert('!!!')}
                        className="mt-6 bg-green-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline self-end"
                    >
                        + Add Reminder
                    </button>
                </div>

                {/* Card 4: Machines Status & AI Prediction Table*/}
                <div className="md:col-span-3 bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-text-dark dark:text-text-light mb-4">Machine Status & Prediction</h3>
                    <div className="mb-4 flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowAddEquipmentModal(true)} 
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add New Machines</span>
                        </button>
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

            {/* Conditional rendering for Add Equipment Modal */}
            {showAddEquipmentModal && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg bg-white bg-dark-bg p-10 rounded-lg shadow-2xl max-w-2xl w-full animate-fade-in-up text-text-dark dark:text-text-light relative">
                        <button
                            onClick={() => setShowAddEquipmentModal(false)}
                            className="absolute top-3 right-3 text-white hover:text-white-600 dark:text-white dark:hover:text-white-200"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <AddEquipmentForm
                            onClose={() => setShowAddEquipmentModal(false)}
                            onSuccess={handleFormSuccess}
                        />
                    </div>
                </div>
            )}
            
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
                            machines={equipmentData.map(eq => ({ id: eq.id, name: eq.name }))} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;