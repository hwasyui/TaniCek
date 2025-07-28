import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EquipmentStatusTable from '../components/EquipmentStatusTable';
import PieChartComponent from '../components/PieChartComponent';
import { checkAuthStatus, fetchAllMachinesWithForecasts } from '../api';

    const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Petani Cerdas');
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // --- AUTH CHECK ---
            // Implement your actual Express API call to check authentication status.
            // const authResponse = await checkAuthStatus();
            // if (!authResponse.isAuthenticated) {
            //   navigate('/login');
            //   return;
            // }
            // setUserName(authResponse.user.name || authResponse.user.email.split('@')[0]);

            // --- FETCH EQUIPMENT DATA WITH FORECASTS ---
            // const machinesResponse = await fetchAllMachinesWithForecasts();
            // if (!machinesResponse.success) {
            //   throw new Error(machinesResponse.message || 'Gagal memuat data alat.');
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
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
            setLoading(false);
        }
        };

        loadDashboardData();
    }, [navigate]);

    const handleLogout = async () => {
        // Implement your actual Express API call for logout
        // await logoutUser();
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

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-primary-bg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tani-green-500"></div>
            <p className="ml-4 text-text-dark">Load To Dashboard</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-primary-bg">
            <p className="text-tani-red-500 mb-4 text-lg">Error: {error}</p>
            <button onClick={handleLogout} className="bg-tani-blue-500 text-white px-4 py-2 rounded-lg hover:bg-tani-blue-600"> Back to Sign In Page </button>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-bg flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-card-bg shadow-sm p-4 flex justify-between items-center">
            <div className="text-3xl font-bold text-tani-green-500">TaniCek</div>
            <div className="flex items-center space-x-6">
            <span className="text-text-dark text-lg hidden md:block">Hello, <span className="font-semibold">{userName}</span>!</span>

            {/* Notification Icon (Placeholder) */}
            <button className="text-text-dark hover:text-gray-700 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {true && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-tani-red-500 rounded-full">2</span>}
            </button>

            {/* User Profile Dropdown / Logout */}
            <div className="relative group">
                <button className="flex items-center space-x-2 text-text-dark hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:block">Profile</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-border-light rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <Link to="/profile" className="block px-4 py-2 text-text-dark hover:bg-gray-100">Profile Settings</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-tani-red-500 hover:bg-gray-100">Log Out</button>
                </div>
            </div>
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
            {/* Card 1: Machine Status Summary */}
            <div className="md:col-span-1 bg-card-bg p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-text-dark text-center mb-4">Machines Status Summary</h3>
            <div className="w-full h-48 flex items-center justify-center">
                <PieChartComponent
                data={[
                    { name: 'High', value: statusCounts.High, color: '#F44336' },
                    { name: 'Medium', value: statusCounts.Medium, color: '#FFC107' },
                    { name: 'Normal', value: statusCounts.Low, color: '#4CAF50' },
                ]}
                />
            </div>
            <div className="mt-6 text-center">
                <p className="text-lg font-bold text-text-dark mb-2">Total Machines : {equipmentData.length}</p>
                <p className="text-md text-tani-green-500">Low : {statusCounts.Low}</p>
                <p className="text-md text-tani-yellow-500">Medium : {statusCounts.Medium}</p>
                <p className="text-md text-tani-red-500">High : {statusCounts.High}</p>
            </div>
            </div>
            
            {/* Card 2: Current Reminder*/}
            <div className="md:col-span-2 bg-card-bg p-6 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold text-text-dark mb-4"> Current Reminder </h3>
            <div className="flex-1 space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                <p className="font-semibold text-tani-blue-500 text-sm">Change the oil in the main generator</p>
                <p className="text-xs text-text-light">Due date: 01 August 2025</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <p className="font-semibold text-tani-yellow-600 text-sm">Check the air filter on the rice threshing machine</p>
                <p className="text-xs text-text-light">It is predicted that it will need to be cleaned this week</p>
                </div>
            {false && <p className="text-center text-text-light italic mt-8">There is no current reminder. Please add manually</p>}
            </div>
            <button
                onClick={() => alert('!!!')} // Placeholder for manual reminder add
                className="mt-6 bg-tani-blue-500 hover:bg-tani-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline self-end"
            >
                + Add Reminder
            </button>
            </div>

            {/* Card 3: Machines Status & AI Prediction Table*/}
            <div className="md:col-span-3 bg-card-bg p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-text-dark mb-4">Machines Status & AI Prediction</h3>
            <div className="mb-4 flex flex-wrap gap-3">
                <button
                onClick={() => navigate('/add-equipment')}
                className="bg-tani-green-500 hover:bg-tani-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center space-x-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Machines</span>
                </button>
                <button
                onClick={() => navigate('/log-activity')}
                className="bg-tani-blue-500 hover:bg-tani-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center space-x-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Add daily log</span>
                </button>
                <button
                onClick={() => navigate('/activity-history')}
                className="bg-gray-200 hover:bg-gray-300 text-text-dark font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center space-x-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>AI Prediction History</span>
                </button>
            </div>

            <EquipmentStatusTable equipment={equipmentData} />
            </div>
        </main>
        </div>
    );
}
export default Dashboard;