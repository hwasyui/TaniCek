import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
            if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            } else {
            document.documentElement.classList.remove('dark'); 
            }
            
            localStorage.setItem('theme', theme);
        }, [theme]);

        const toggleTheme = () => {
            setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
        };

        return (
            <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200
                        flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            aria-label="Toggle theme"
            >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.459 4.293a1 1 0 01-1.182-1.314l1.58-2.37a1 1 0 111.628 1.087l-1.58 2.37zM14 10a4 4 0 11-8 0 4 4 0 018 0zM5.707 14.293a1 1 0 101.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zm-4.293-4.707a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM.293 6.707a1 1 0 011.414-1.414l.707.707a1 1 0 11-1.414 1.414l-.707-.707zm14.293-4.293a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            )}
            </button>
        );
    };

    export default ThemeToggle;