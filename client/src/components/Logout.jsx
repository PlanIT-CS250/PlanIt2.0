import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; //To navigate to other pages in the app

function Logout() {
    const navigate = useNavigate();
    
    useEffect(() => {
        try {
            localStorage.removeItem('token');
            navigate('/');
        }
        catch (error) {
            navigate('/');
        }
    }, []);
    return (
        <h1>Logging out!</h1>
    )

}
export default Logout;