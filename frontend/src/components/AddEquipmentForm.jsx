import React, { useState } from 'react';

const AddEquipmentForm = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [locationLat, setLocationLat] = useState('');
    const [locationLon, setLocationLon] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const machineTypes = [
        'HVAC', 'Generator', 'Tractor', 'Water Pump', 'Sprayer', 'Field', 'Others'
    ]

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
try {
    if (!name || !type) {
        throw new Error('The name and type of machine must be filled in');
    }
    if ((locationLat && isNaN(parseFloat(locationLat))) || (locationLon && isNaN(parseFloat(locationLon)))) {
        throw new Error('Location coordinates must be numbers');
    }
    const newMachine = {
        name,
        type,
        location_lat: locationLat ? parseFloat(locationLat) : null,
        location_lon: locationLon ? parseFloat(locationLon) : null,
    };

    const response = await addMachine(newMachine);
    if (!response.success) {
        throw new Error(response.message || 'Failed to add machine');
    }

    console.log('New machine added:', response.data);
        alert('Successfully added!'); 
        onSuccess();
        onClose();
        
    } catch (err) {
        console.error('Error adding equipment:', err.message);
        setError(err.message || 'Failed to add machine ');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="p-8">
        <h2 className="text-green-500 text-2xl font-bold dark:text-text-light mb-6 text-center">Add New Machines</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
            <label className="block text-text-dark bg-white dark:text-text-light text-sm font-semibold mb-2" htmlFor="name">
                Machine Name <span className="text-red-500">*</span>
            </label>
            <input
                className="shadow appearance-none border border-border-light dark:border-dark-border-light rounded w-full py-2 px-3 text-text-dark dark:text-text-light leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-white"
                id="name"
                type="text"
                placeholder="Ex: Generator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            </div>
            <div className="mb-4">
            <label className="block text-text-dark dark:text-text-light text-sm font-semibold mb-2" htmlFor="type">
                Machine Type <span className="text-red-500">*</span>
            </label>
            <select
                className="shadow appearance-none border border-border-light dark:border-dark-border-light rounded w-full py-2 px-3 text-text-dark dark:text-text-light leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-white"
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
            >
                <option value="">-- Select Type --</option>
                {machineTypes.map((mt) => (
                <option key={mt} value={mt}>{mt}</option>
                ))}
            </select>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
                <label className="block text-text-dark dark:text-text-light text-sm font-semibold mb-2" htmlFor="locationLat">
                Latitude Location
                </label>
                <input
                className="shadow appearance-none border border-border-light dark:border-dark-border-light rounded w-full py-2 px-3 text-text-dark dark:text-text-light leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-white"
                id="locationLat"
                type="text"
                placeholder="Ex: -6.2088"
                value={locationLat}
                onChange={(e) => setLocationLat(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-text-dark dark:text-text-light text-sm font-semibold mb-2" htmlFor="locationLon">
                Longitude Location
                </label>
                <input
                className="shadow appearance-none border border-border-light dark:border-dark-border-light rounded w-full py-2 px-3 text-text-dark dark:text-text-light leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-white"
                id="locationLon"
                type="text"
                placeholder="Ex: 106.8456"
                value={locationLon}
                onChange={(e) => setLocationLon(e.target.value)}
                />
            </div>
            </div>

            {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}
            
            <div className="flex items-center justify-between mt-6">
            <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
            >
            {loading ? 'Loading...' : 'Save'}
            </button>
            <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-black text-opacity-50 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
            Cancel
            </button>
            </div>
        </form>
        </div>
    );
};

export default AddEquipmentForm;
