// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserName() {
            try
            {
                const token = localStorage.getItem('token');
                const res = await axios.get("http://localhost:3000/planets/6716b05e03ae2588c9b0a809", 
                    { headers: {
                    'Authorization': `Bearer ${token}`
                }});

                if (res.data.role)
                {
                    console.log(res.data.role);
                }
            }
            catch (error) {
                console.log(error);
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