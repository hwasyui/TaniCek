import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react';

const getWeatherIcon = (condition) => {
    const iconClass = "w-5 h-5 mr-1 text-gray-600 dark:text-gray-300";

    switch (condition) {
        case 'Sunny':
        return <Sun className={iconClass} />;
        case 'Cloudy':
        return <Cloud className={iconClass} />;
        case 'Rainy':
        return <CloudRain className={iconClass} />;
        case 'Windy':
        return <Wind className={iconClass} />;
        default:
        return null;
    }
    };

    const StatusBadge = ({ level, onClick, reason }) => {
        let colorClass = '';
        let statusText = '';
        let icon = null;
        
        switch (level) {
            case 'High':
            colorClass = 'bg-red-500';
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
            colorClass = 'bg-yellow-500';
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
            colorClass = 'bg-green-500';
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

    const buttonClass = `px-3 py-1 text-xs font-semibold text-white rounded-full flex items-center transition-transform duration-100 ${colorClass} cursor-pointer hover:scale-105`;

    return (
        <button
        onClick={onClick} 
        title={`Show Details ${statusText}`}
        className={buttonClass}
        >
        {icon} {statusText}
        </button>
    );
};

    const EquipmentStatusTable = ({ equipment }) => {
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [currentReason, setCurrentReason] = useState('');
    const [currentEquipmentName, setCurrentEquipmentName] = useState('');
    const [showWeatherModal, setShowWeatherModal] = useState(false); 
    const [currentWeather, setCurrentWeather] = useState(null); 

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
    
    // for weather func
    const handleShowWeatherModal = (item) => {
        setCurrentWeather(item);
        setShowWeatherModal(true);
    };

    const handleCloseWeatherModal = () => {
        setShowWeatherModal(false);
        setCurrentWeather(null);
    };


    if (!equipment || equipment.length === 0) {
        return (
        <p className="text-center text-text-light dark:text-text-light italic mt-8">
            No equipment data yet. Please use the "Add New Machines" button on the dashboard.
        </p>
        );
    }

    return (
        <div className="overflow-x-auto shadow-sm rounded-lg border border-border-light dark:border-dark-border-light">
        <table className="min-w-full divide-y divide-border-light dark:divide-dark-border-light">
            <thead className="bg-green-400 dark:bg-green-500">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs text-white font-medium text-text-light dark:text-text-light uppercase tracking-wider">
                Machine Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-white font-medium text-text-light dark:text-text-light uppercase tracking-wider">
                Machine Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-white font-medium text-text-light dark:text-text-light uppercase tracking-wider">
                Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-white font-medium text-text-light dark:text-text-light uppercase tracking-wider">
                Machine Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-white font-medium text-text-light dark:text-text-light uppercase tracking-wider">
                Log Activity
                </th>
            </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border-light dark:bg-dark-card-bg dark:divide-dark-border-light">
            {equipment.map((item) => (
                <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark dark:text-text-light">
                    {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light dark:text-text-light">
                    {item.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light dark:text-text-light">
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
                    <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">No data prediction</span>
                    )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light dark:text-text-light">
                    <button
                    onClick={() => handleShowWeatherModal(item)} 
                    className="flex items-center space-x-2 text-text-light dark:text-text-light hover:text-gray-700 dark:hover:text-gray-300"
                    >
                    {getWeatherIcon(item.weatherCondition)}
                    <span>{item.lastLogDate || 'N/A'}</span>
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* Reason Modal */}
        {showReasonModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card-bg dark:bg-dark-card-bg p-10 bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in-up text-text-dark dark:text-text-light">
                <h3 className="text-xl font-bold mb-4">Machine Prediction Info: {currentEquipmentName}</h3>
                <p className="text-text-light dark:text-text-light mb-6">{currentReason}</p>
                <div className="flex justify-end">
                <button
                    onClick={handleCloseReason}
                    className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Close
                </button>
                </div>
            </div>
            </div>
        )}
        
        {/* weather modal */}
        {showWeatherModal && currentWeather && (
            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-card-bg dark:bg-dark-card-bg p-10 bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in-up text-text-dark dark:text-text-light">
                    <h3 className="text-xl font-bold text-center mb-4">Weather Details for {currentWeather.name}</h3>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-5xl">{getWeatherIcon(currentWeather.weatherCondition)}</div>
                        <p className="text-lg font-semibold">{currentWeather.weatherCondition}</p>
                        <p className="text-sm text-center text-text-light dark:text-gray-400 italic">
                            {currentWeather.weatherPrediction || 'No prediction available.'}
                        </p>
                    </div>
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleCloseWeatherModal}
                            className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default EquipmentStatusTable;