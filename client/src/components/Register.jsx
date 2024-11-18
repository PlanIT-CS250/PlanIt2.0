// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import '../styles/Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    async function handleRegister(e) {
        e.preventDefault();
        try
        {
            //Submit info to attempt registration
            const res = await axios.post("http://localhost:3000/users/register", 
            { firstName: firstName, lastName: lastName, username: username, email: email, password: password});
            
            //If token is recieved in response, user registration was successful
            if (res.data.token) {
                //Store token in local storage and navigate to home.jsx
                localStorage.setItem('token', res.data.token);
                navigate("/hub");
            }
            else {
                alert("Server error: Token not found. Try again later or contact support.");
            }
        }
        //Error adding new user
        catch(error) {
            alert(error.message);
            alert(error.response.data.message);
        }
    }

    return (
        <div className="register-container">
            <form onSubmit={handleRegister} className="register-form">
                <h2>Register</h2>
                <div className="register-input-group">
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <label htmlFor="firstname">First name</label>
                </div>
                <div className="register-input-group">
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    <label htmlFor="lastName">Last name</label>
                </div>
                <div className="register-input-group">
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="username">Username</label>
                </div>
                <div className="register-input-group">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="email">Email</label>
                </div>
                <div className="register-input-group">
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password</label>
                </div>
                <button type="submit" className="registers-button">Register</button>
            </form>
        </div>
    );
}


export default Register;