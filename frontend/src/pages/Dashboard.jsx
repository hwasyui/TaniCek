'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [machines, setMachines] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || !user.company) {
      setError('No valid session found. Please log in.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [companyRes, machinesRes] = await Promise.all([
          axios.get(`http://localhost:3000/companies/${user.company}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3000/machines/company/${user.company}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCompany(companyRes.data);
        setMachines(machinesRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-green-700">
            Welcome to {company?.name}'s Dashboard
          </h1>
          {company?.image && (
            <img
              src={company.image}
              alt={`${company.name} Logo`}
              className="w-40 h-40 mx-auto mt-4 object-contain rounded-lg shadow"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {machines.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              No machines found for this company.
            </div>
          ) : (
            machines.map((machine) => (
              <div
                key={machine._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold text-gray-800">{machine.name}</h2>
                <p className="text-sm text-gray-600 mt-1">Type: {machine.type}</p>
                <p className="text-sm text-gray-600">Location: {machine.location}</p>
                <p className="text-sm text-gray-600">Status: {machine.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
