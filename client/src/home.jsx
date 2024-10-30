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
                const res = await axios.post(`http://localhost:3000/planets/671e489598964232f2b32b09/columns`, 
                    {
                        name: "my new column"
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log(res.data);
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