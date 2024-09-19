import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserName() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/'); //Redirect to home if no token in local storage (token expired)
                return;
            }

            try 
            {
                const response = await axios.get('http://localhost:3000/users/name', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFirstName(response.data.firstName);
            } 
            catch (error) {
                console.error('Failed to fetch user info:', error);
                navigate('/'); //Redirect to login on error
            }
        };

        fetchUserName();
    }, [navigate]);

    return (
        <div>
            <h1>Welcome, {firstName}!</h1>
        </div>
    );
}

export default Home;