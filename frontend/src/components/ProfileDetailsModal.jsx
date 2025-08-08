import React from 'react';

    const ProfileDetailsModal = ({ onClose, userProfile }) => {
        if (!userProfile) {
            return (
            <div className="p-8 text-center text-text-light dark:text-gray-400">
                <p>Loading profile data or data not available...</p>
                <button onClick={onClose} className="mt-4 bg-gray-300 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">Close</button>
            </div>
            );
        }
        
        return (
            <div className="p-8">
            <h2 className="text-green-500 bg-white opacity-50 text-2xl font-bold dark:text-text-light mb-6 text-center">Profile Details</h2>
            
            <div className="space-y-4">
                <div>
                <label className="block bg-white text-text-light dark:text-black text-sm font-medium mb-1">Name:</label>
                <p className="bg-white text-text-dark dark:text-text-light text-lg font-semibold">{userProfile.name}</p>
                </div>
                <div>
                <label className="block bg-white text-text-light dark:text-black text-sm font-medium mb-1">Email:</label>
                <p className="bg-white text-text-dark dark:text-text-light text-lg font-semibold">{userProfile.email}</p>
                </div>
                <div>
                <label className="block bg-white text-text-light dark:text-black text-sm font-medium mb-1">Role Status:</label>
                <p className="bg-white text-text-dark dark:text-text-light text-lg font-semibold capitalize">{userProfile.isAdmin ? 'Admin' : 'User'}</p>
                </div>
                <div>
                {/* <label className="block bg-white text-text-light dark:text-black text-sm font-medium mb-1">Joined Date:</label>
                <p className="bg-white  text-text-dark dark:text-text-light text-lg font-semibold">
                    {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p> */}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                >
                Close
                </button>
            </div>
            
            </div>
        );
    };

    export default ProfileDetailsModal;
    