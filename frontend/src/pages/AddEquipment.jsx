import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMachine } from '../api';

const AddEquipment = () => {
const navigate = useNavigate();
const [name, setName] = useState('');
const [type, setType] = useState('');
const [locationLat, setLocationLat] = useState('');
const [locationLon, setLocationLon] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);

const machineTypes = ['HVAC', 'Genset', 'Tractor', 'Pompa Air', 'Sprayer', 'Lahan', 'Others'];

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

try {
    if (!name || !type) {
        throw new Error('Machine name and type are required to fill out');
    }
    if ((locationLat && isNaN(parseFloat(locationLat))) || (locationLon && isNaN(parseFloat(locationLon)))) {
        throw new Error('Coordinates must be valid numbers');
    }

const newMachine = {
    name,
    type,
    location_lat: locationLat ? parseFloat(locationLat) : null,
    location_lon: locationLon ? parseFloat(locationLon) : null,
    // created_at will be set by the backend (database default or Express logic)
    // user_id will be added by the backend based on the authenticated user
};

const response = await addMachine(newMachine);
if (!response.success) {
    throw new Error(response.message || 'Failed to add new machine. Please try again');
}

    console.log('New machine added:', response.data);
    setSuccess(true);    
    setName('');
    setType('');
    setLocationLat('');
    setLocationLon('');
    alert('Machine added successfully!');
    navigate('/dashboard');
} 

catch (err) {
    console.error('Error adding equipment:', err.message);
    setError(err.message || 'Failed to add new machine. Please try again');
    } finally {
    setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-primary-bg p-6">
        <div className="max-w-2xl mx-auto bg-card-bg p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-text-dark mb-6 text-center">Add New Machines Status</h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="name">
                Machine Name <span className="text-tani-red-500">*</span>
                </label>
                <input
                className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-tani-green-500"
                id="name"
                type="text"
                placeholder="Ex. tractor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
            </div>
            <div className="mb-4">
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="type">
                Machines type <span className="text-tani-red-500">*</span>
                </label>
                <select
                className="shadow border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-tani-green-500"
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
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="locationLat">
                    Lat Location
                </label>
                <input
                    className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-tani-green-500"
                    id="locationLat"
                    type="text"
                    placeholder="Ex: -6.2088"
                    value={locationLat}
                    onChange={(e) => setLocationLat(e.target.value)}
                />
                </div>
                <div>
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="locationLon">
                    Long Location
                </label>
                <input
                    className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-tani-green-500"
                    id="locationLon"
                    type="text"
                    placeholder="Ex: 106.8456"
                    value={locationLon}
                    onChange={(e) => setLocationLon(e.target.value)}
                />
                </div>
            </div>
            {/* Note: 'purchase_date' from your schema is typically a separate field,
                but for this MVP, if it represents 'date added', backend might set created_at.
                If you need a dedicated purchase date input, add it here and in your Express API.
            */}
            {/* <div className="mb-6">
                <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="purchaseDate">
                Tanggal Pembelian
                </label>
                <input
                className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-tani-green-500"
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                />
            </div> */}


            {error && <p className="text-tani-red-500 text-sm italic mb-4">{error}</p>}
            {success && <p className="text-tani-green-500 text-sm italic mb-4">Machines Add Successfully!</p>}

            <div className="flex items-center justify-between">
                <button
                className="bg-tani-green-500 hover:bg-tani-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
                >
                {loading ? 'Loading to Save...' : 'Save'}
                </button>
                <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                >
                Cancel
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}
export default AddEquipment;