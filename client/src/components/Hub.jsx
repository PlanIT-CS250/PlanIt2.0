// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; //To navigate to other pages in the app
import { NavLink } from 'react-router-dom';
import axios from 'axios'; //To make requests to the server
import '../styles/Hub.css';
import profileImage from '../assets/profile.png';
import logoImage from '../assets/logo.png';
import { FaCog } from 'react-icons/fa'; // Import the gear icon
import { jwtDecode } from 'jwt-decode'; //To decode userId from token

function Hub() {
    const [cards, setCards] = useState([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [userId, setUserId] = useState();
    const [user, setUser] = useState();
    const [ownedPlanets, setOwnedPlanets] = useState();
    const [collaboratedPlanets, setCollaboratedPlanets] = useState();
    const maxCards = 15; // Set the maximum number of cards
    const navigate = useNavigate();

    //Decode token to get userId
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
            } catch (error) {
                alert("Unable to decode token. Try logging in again or contact support.");
                console.log(error);
                // navigate('/'); // Redirects to login. Uncomment when testing is finished
            }
        } else {
            // navigate('/'); // Redirects to login. Uncomment when testing is finished
        }
    }, []);

    //Fetch user data
    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:3000/users/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setUser(res.data.user);
                } catch (error) {
                    console.log(error);
                    // navigate('/'); // Redirect to login. Uncomment when testing is finished
                }
            };
            fetchUserData();
        }
    }, [userId]); // useEffect hooks runs when userId changes

    //Fetch all planets for user
    useEffect(() => {
        if (user)
        {
            const fetchPlanets = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:3000/planets/user/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setOwnedPlanets(res.data.ownedPlanets);
                    setCollaboratedPlanets(res.data.collaboratedPlanets);
                } catch (error) {
                    console.log(error);
                    // navigate('/'); // Redirect to login. Uncomment when testing is finished
                }
            };
            fetchPlanets();
            
        }
    }, [user]); // useEffect hooks runs when user changes



    const addNewCard = () => {
        if (cards.length < maxCards) {
            const newCard = {
                id: cards.length + 1,
                title: `Card ${cards.length + 1}`,
                description: `This is card ${cards.length + 1}`,
                imageUrl: 'https://via.placeholder.com/150' // Placeholder image URL
            };
            setCards([...cards, newCard]);
        } else {
            alert('Maximum number of cards reached');
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="hub-container">
            <div className="hub-nav-top">
                <div className="hub-nav-left">
                    <NavLink to="/home" className="home">
                        <img src={logoImage} alt="Logo" className="logo-image" />
                    </NavLink>
                    <NavLink to="/teams" className="teams">Teams</NavLink>
                    <NavLink to="/projects" className="projects">Projects</NavLink>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="hub-nav-right">
                    <NavLink to="/settings" className="settings">
                        <FaCog className="settings-icon" />
                    </NavLink>
                    <div className="profile" onClick={toggleDropdown}>
                        <img src={profileImage} alt="Profile" className="profile-image" />
                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="profile-header">
                                    <span className="profile-name">Benjamin Green</span>
                                    <span className="profile-email">benjamin.green5@snhu.edu</span>
                                </div>
                                <div className="profile-options">
                                    <NavLink to="/quickstart">Open Quickstart</NavLink>
                                    <NavLink to="/profile">Profile</NavLink>
                                    <NavLink to="/personal-settings">Personal settings</NavLink>
                                    <NavLink to="/notifications">Notifications</NavLink>
                                    <NavLink to="/theme">Theme</NavLink>
                                    <NavLink to="/logout">Log out</NavLink>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-container">
                {cards.map(card => (
                    <div className="card" key={card.id}>
                        <img src={card.imageUrl} alt={card.title} className="card-image" />
                        <div className="card-content">
                            <h4>{card.title}</h4>   
                            <p>{card.description}</p>
                            <button className="card-button">Visit</button>
                        </div>
                    </div>
                ))}
                {cards.length < maxCards && (
                    <div className="card add-card" onClick={addNewCard}>
                        <h4>+</h4>
                        <p>Add New Card</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Hub;