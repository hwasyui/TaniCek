import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllMachines, addLog } from '../api';

const LogActivity = () => {
const navigate = useNavigate();
    const [machines, setMachines] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [weatherInfo, setWeatherInfo] = useState(null);

    useEffect(() => {
        const getMachines = async () => {
        // --- FETCH MACHINES FOR DROPDOWN ---
        // Implement your actual Express API call to fetch machines
        // const response = await fetchAllMachines(); // Assume this returns { success: true, data: [...] }
        // if (response.success) {
        //   setMachines(response.data);
        // } else {
        //   setError(response.message || 'Gagal memuat daftar alat.');
        // }

        // --- SIMULATE FETCHING MACHINES ---
        const dummyMachines = [
            { id: 'machine-1', name: 'Generator' },
            { id: 'machine-2', name: 'Irrigation Pump A' },
            { id: 'machine-3', name: 'Tractor' },
            { id: 'machine-4', name: 'HVAC Storage Warehouse' },
        ];
        setMachines(dummyMachines);
        
        // --- SIMULATE WEATHER FETCH (Backend will do this upon log submission) ---
        setWeatherInfo({
            temperature: 32,
            humidity: 63,
            weather_main: 'Sunny',
            aqi: 3,
        });

        };
        getMachines();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
        if (!selectedMachineId || !note) {
            throw new Error('Please select a machine and enter a note!');
        }

        const logData = {
            machine_id: selectedMachineId,
            note: note,
            // date will be added by backend (current date)
            // user_id will be added by backend (authenticated user)
            // weather data will be fetched by backend upon receiving this log
        };

        const response = await addLog(logData); // Call your Express API to add log
        if (!response.success) {
            throw new Error(response.message || 'Failed to save log. Please try again');
        }

        console.log('Log submitted:', response.data);
        setSuccess(true);
        // Clear form after successful submission
        setSelectedMachineId('');
        setNote('');
        alert('Log activity saved successfully!');
        navigate('/dashboard');

        } catch (err) {
        console.error('Error submitting log:', err.message);
        setError(err.message || 'Failed to save log. Please try again');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-bg p-6">
        <div className="max-w-2xl mx-auto bg-card-bg p-8 rounded-lg shadow-lg">
            <h2 className="text-green-500 text-2xl font-bold text-text-dark mb-6 text-center">Add Operator Daily Log</h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="machineSelect">
                Select Machine <span className="text-red-500">*</span>
                </label>
                <select
                className="shadow border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                id="machineSelect"
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                required
                >
                <option value="">-- Select Machines --</option>
                {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                    {machine.name}
                    </option>
                ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="note">
                Log Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                id="note"
                placeholder="enter your log notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                ></textarea>
            </div>

            <div className="mb-6 p-4 bg-gray-50 border border-border-light rounded-md">
                <h4 className="font-semibold text-text-dark mb-2">Weather Information (Automatic)</h4>
                {weatherInfo ? (
                <>
                    <p className="text-sm text-text-light">Temperature: {weatherInfo.temperature}°C</p>
                    <p className="text-sm text-text-light">Humidity: {weatherInfo.humidity}%</p>
                    <p className="text-sm text-text-light">Condition: {weatherInfo.weather_main}</p>
                    <p className="text-sm text-text-light">AQI: {weatherInfo.aqi} (Air Quality Indeks)</p>
                    <p className="text-xs text-gray-500 mt-2"> Weather data will be automatically retrieved by the system when this log is saved. </p>
                </>
                ):(
                <p className="text-sm text-text-light italic">Loading for Weather Info...</p>
                )}
            </div>

            {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm italic mb-4">daily log saved!</p>}

            <div className="flex items-center justify-between">
                <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
                >
                {loading ? 'Loading...' : 'Log Saved'}
                </button>
                <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-300 hover:bg-gray-400 text-black text-opacity-50 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                >
                Cancel
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default LogActivity;