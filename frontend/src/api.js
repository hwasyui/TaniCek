const API_BASE_URL = 'http://localhost:3000'; 

    const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return { success: true, data };
    };

    // --- Auth Endpoints ---

    export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        });
        const result = await handleResponse(response);
        // On successful login, store token (example)
        if (result.success && result.data.token) {
        localStorage.setItem('authToken', result.data.token);
        }
        return result;
    } catch (error) {
        console.error('API Login Error:', error);
        return { success: false, message: error.message };
    }
    };

    export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Register Error:', error);
        return { success: false, message: error.message };
    }
    };

    export const checkAuthStatus = async () => {
    try {
        // This endpoint on your Express server should return if user is authenticated
        // and optionally user data (e.g., name, email, role)
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
        headers: getAuthHeaders(),
        });
        const data = await response.json();
        return { isAuthenticated: data.isAuthenticated, user: data.user };
    } catch (error) {
        console.error('API Auth Status Error:', error);
        return { isAuthenticated: false, user: null };
    }
    };

    export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, { // Your Express logout endpoint
        method: 'POST',
        headers: getAuthHeaders(),
        });
        localStorage.removeItem('authToken'); // Clear token on frontend
        return await handleResponse(response);
    } catch (error) {
        console.error('API Logout Error:', error);
        return { success: false, message: error.message };
    }
    };


    // --- Machine Endpoints ---

    export const fetchAllMachines = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/machines`, { // Fetch just machines for LogActivity dropdown
        headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Fetch Machines Error:', error);
        return { success: false, message: error.message };
    }
    };

    export const fetchAllMachinesWithForecasts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/machines-with-forecasts`, {
        headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Fetch Machines with Forecasts Error:', error);
        return { success: false, message: error.message };
    }
    };

    export const addMachine = async (machineData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/machines`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(machineData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Add Machine Error:', error);
        return { success: false, message: error.message };
    }
    };

    // --- User Log Endpoints ---

    export const addLog = async (logData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user-logs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(logData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Add Log Error:', error);
        return { success: false, message: error.message };
    }
    };

    // --- User profile endpoint ---
    export const fetchUserProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, { 
        headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Something wrong with user profile:', error);
        return { success: false, message: error.message };
    }
    };
    
// --- You'll add more API calls here for Weather Logs, Forecasts, Reminders if needed ---
// For instance, fetchActivityHistory, fetchReminders, etc.