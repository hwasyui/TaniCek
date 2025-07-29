import React, { useState, useEffect } from 'react';
import { addLog } from '../api'; 

const LogActivityForm = ({ onClose, onSuccess, machines }) => {
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    //const [weatherInfo, setWeatherInfo] = useState(null); 


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

try {
    if (!selectedMachineId || !note) {
        throw new Error('Select and fill the notes');
    }

const logData = {
    machine_id: selectedMachineId,
    note: note,
};

const response = await addLog(logData); // Panggil API Express Anda untuk menambahkan log
    if (!response.success) {
        throw new Error(response.message || 'Failed to saved');
    }

    console.log('Log submitted:', response.data);
    alert('Successfully saved!'); 
    onSuccess();
    onClose();

    } catch (err) {
    console.error('Error submitting log:', err.message);
    setError(err.message || 'Failed to saved');
    } finally {
    setLoading(false);
    }
}

    return (
        <div className="p-8">
        <h2 className="text-green-500 text-2xl font-bold text-text-dark dark:text-text-light mb-6 text-center">Add Daily Log</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
            <label className="block text-text-dark bg-white dark:text-text-light text-sm font-semibold mb-2" htmlFor="machineSelect">
                Select Machines <span className="text-red-500">*</span>
            </label>
            <select
                className="shadow appearance-none border border-border-light dark:border-dark-border-light rounded w-full py-2 px-3 text-text-dark dark:text-text-light leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-white"
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
            <label className="block text-text-dark dark:text-text-light text-sm font-semibold mb-2" htmlFor="note">
                Log Notes <span className="text-red-500">*</span>
            </label>
            <textarea
                className="shadow appearance-none border border-border-light dark:border-dark-border-light rounded w-full py-2 px-3 text-text-dark dark:text-text-light leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 h-32 bg-white dark:bg-white"
                id="note"
                placeholder="Ex: The engine sounds normal, but there is a slight vibration. The temperature is stable"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
            ></textarea>
            </div>

            {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}

            <div className="flex items-center justify-between mt-6">
            <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Saved'}
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

export default LogActivityForm;
