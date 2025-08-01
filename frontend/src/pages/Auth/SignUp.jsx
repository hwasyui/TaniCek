import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); 
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null); 

        try {
            const response = await registerUser({ email, password });
            if (!response.success) {
                throw new Error(response.message || 'Sign Up failed. Please try again');
            }

            console.log('Signup successful:', response.data);
            setSuccessMessage('Successfully signed up! Please log in to continue.'); 
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Signup error:', err.message);
            setError(err.message || 'Something wrong to sign up. Please try again');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-bg">
            <div className="bg-card-bg p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-3xl font-bold text-center text-green-500 mb-6">TaniCek</h2>
                <p className="text-xl text-center text-text-dark mb-8">Sign up with new account</p>
                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                            id="password"
                            type="password"
                            placeholder="Minimal 6 Characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                        {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                        {successMessage && <p className="text-green-500 text-xs italic mt-2">{successMessage}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Sign Up'}
                        </button>
                    </div>
                    <p className="text-center text-sm text-text-dark mt-4">
                        Don't have account yet ? <Link to="/login" className="text-blue-500 hover:underline font-semibold">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Signup;