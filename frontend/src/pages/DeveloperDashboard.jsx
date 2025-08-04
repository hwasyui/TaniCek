import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

function DeveloperDashboard() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };
  return (
    <div>
        Developer Dashboard
        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-green-100 dark:hover:bg-green-500">Log Out</button>
    </div>
    
  )
}

export default DeveloperDashboard