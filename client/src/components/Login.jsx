import React, { useState } from 'react';
import './login.css'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() 
{
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e) 
    {
        e.preventDefault();
        try
        {
            const res = await axios.post("http://localhost:3000/users/login", { email: username, password: password });

            //If token is recieved in response, authentication was successful
            if (res.data.token) {
                //Store token in local storage and navigate to home.jsx
                localStorage.setItem('token', res.data.token);
                navigate("/home");
            }
            else {
                alert("Token not found");
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
        <div className="login-container">
            <form  onSubmit={handleLogin}>
                <h2>PlanIT Login</h2>
                <div className="input-group">
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="username">Username</label>
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
                    <a href="/register" className="register-link">No account? Click here to register</a>
                </div>
            </form>
        </div>
    );
}

export default Login;