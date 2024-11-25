// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import '../styles/login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() 
{
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Regex pattern of typical email format
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    //Runs upon submitting login info
    async function handleLogin(e) 
    {
        e.preventDefault();
        let res = null;
        try {
            res = await axios.post("http://localhost:3000/auth/login", { email, password });
        }
        catch (error) 
        {
            //Response and status code were returned from server
            if (error.response?.status) {
                alert(error.response.data.message);
                console.error(error.response);
            }
            //Request succeeded but received no response
            else if (!error.response && error.request)
            {
                alert("We are unable to authorize your login. Contact support or try again later.");
                console.error(error.response);
            }
            //Client-side error in setting up the request
            else {
                alert("There was an error with the request. Contact support or try again later.");
                console.error(error.message);
            }
        }

        //If token is recieved in response, authentication was successful
        if (res?.data?.token) {
            //Store token in local storage and navigate to home.jsx
            localStorage.setItem('token', res.data.token);
            navigate("/hub");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <form  onSubmit={handleLogin}>
                <h2>PlanIt Login</h2>
                <div className="input-group">
                    <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => {setEmail(e.target.value)}}
                        required
                    />
                    <label htmlFor="email">Email or Username</label>
                </div>
                <div className="input-group">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <i
                        className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                        id="togglePassword"
                        onClick={togglePasswordVisibility}
                        style={{ cursor: 'pointer' }}
                    ></i>
                </div>
                <button type="submit">Login</button>
                <div>
                    <a href="/register" className="registers-link">No account? Click here to register</a>
                </div>
            </form>
        </div>
    );
}

export default Login;