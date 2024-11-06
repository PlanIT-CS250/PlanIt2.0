// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let res = null;
        async function fetchUserName() {
            try
            {
                const token = localStorage.getItem('token');
                res = await axios.delete(`http://localhost:3000/planets/columns/672b7a615d108cae51b6fb5a`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log(res.data.message);
                alert(res.data.message);
            }
            catch (error) {
                console.log(error.response.data.message);
                alert(error.response.data.message); 
            }
        };
        fetchUserName();
        if (res?.data?.message)
        {
            alert(res.data.message);
        }
    }, []);

    return (
        <div>
            <h1>Welcome, {firstName}!</h1>
        </div>
    );
}

export default Home;