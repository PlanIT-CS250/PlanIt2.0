// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() 
{
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    


    async function handleLogin(e) 
    {
        e.preventDefault();
        try
        {
            const res = await axios.post("http://localhost:3000/auth/login", { email: email, password: password });

            //If token is recieved in response, authentication was successful
            if (res.data.token) {
                //Store token in local storage and navigate to home.jsx
                localStorage.setItem('token', res.data.token);
                navigate("/hub");
            }
            else {
                alert("Server error: Token not found. Try again later or contact support.");
            }
        }
        catch (error) {
            alert(error.response.data.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <body className="login-body">    
            <div className="login-container">
                <form  onSubmit={handleLogin} className="login-form">
                    <h2>PlanIt Login</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="email" className="email-label">Email</label>
                    </div>
                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="password" className="password-label">Password</label>
                        <i
                            className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                            id="togglePassword"
                            onClick={togglePasswordVisibility}
                            style={{ cursor: 'pointer' }}
                        ></i>
                    </div>
                    <button type="submit" className="login-button">Login</button>
                    <div>
                        <a href="/register" className="registers-link">No account? Click here to register</a>
                    </div>
                </form>
            </div>
        </body>
    );
}

export default Login;