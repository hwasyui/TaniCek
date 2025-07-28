import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Reusable component for status badge
const StatusBadge = ({ level, onClick, reason }) => {
let colorClass = '';
let statusText = '';
let icon = null;

    switch (level) {
        case 'High':
        colorClass = 'bg-tani-red-500';
        statusText = 'High';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor">
            <path 
            fillRule="evenodd" 
            d="M8.257 3.342a.75.75 0 00-.91-.213L4.364 4.173A9.268 9.268 0 003 10a9.268 9.268 0 001.364 5.827l2.983 1.044a.75.75 0 00.91-.213C9.728 15.698 12 12.872 12 10s-2.272-5.698-3.743-6.658zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
            clipRule="evenodd" 
            />
            </svg>
        );break

        case 'Medium':
        colorClass = 'bg-tani-yellow-500';
        statusText = 'Medium';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor">
            <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
            />
            </svg>
        );break

        case 'Low':
        colorClass = 'bg-tani-green-500';
        statusText = 'Low';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor">
            <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clipRule="evenodd" 
            />
            </svg>
        );break
        
        default:
        colorClass = 'bg-gray-400';
        statusText = 'Undefined';
    }

    return (
        <div className="relative inline-flex items-center">
        <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full flex items-center ${colorClass}`}>
            {icon} {statusText}
        </span>
        {(level === 'High' || level === 'Medium') && reason && (
            <button
            onClick={onClick}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            title="See Details"
            >
            <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}>
            <path strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
            </svg>
            </button>
        )}
        </div>
    )
}

const EquipmentStatusTable = ({ equipment }) => {
const [showReasonModal, setShowReasonModal] = useState(false);
const [currentReason, setCurrentReason] = useState('');
const [currentEquipmentName, setCurrentEquipmentName] = useState('');

const handleShowReason = (name, reason) => {
    setCurrentEquipmentName(name);
    setCurrentReason(reason);
    setShowReasonModal(true);
};

const handleCloseReason = () => {
    setShowReasonModal(false);
    setCurrentReason('');
    setCurrentEquipmentName('');
};

if (!equipment || equipment.length === 0) {
    return (
    <p className="text-center text-text-light italic mt-8">
        Undefined. Click Add button! <Link to="/add-equipment" className="text-tani-green-500 hover:underline">Add New Tools</Link>.
    </p>
    )
}

    return (
        <div className="overflow-x-auto shadow-sm rounded-lg border border-border-light">
        <table className="min-w-full divide-y divide-border-light">
            <thead className="bg-gray-50">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                Machine Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                Machine Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                Machine Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                Log Activity
                </th>
            </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border-light">
            {equipment.map((item) => (
                <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                    {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                    {item.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                    Lat: {item.location_lat}, Lon: {item.location_lon}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.forecast ? (
                    <StatusBadge
                        level={item.forecast.level}
                        reason={item.forecast.reason}
                        onClick={() => handleShowReason(item.name, item.forecast.reason)}
                    />
                    ) : (
                    <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">There is no data prediction</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                    {item.lastLogDate || 'N/A'}
                </td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* Reason Modal */}
        {showReasonModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-card-bg p-8 rounded-lg shadow-2xl max-w-md w-full animate-fade-in-up">
            <h3 className="text-xl font-bold text-text-dark mb-4">Details : {currentEquipmentName}</h3>
            <p className="text-text-light mb-6">{currentReason}</p>
                <div className="flex justify-end">
                    <button onClick={handleCloseReason} className="bg-tani-blue-500 hover:bg-tani-blue-600 text-white font-bold py-2 px-4 rounded-lg"> Close </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default EquipmentStatusTable;