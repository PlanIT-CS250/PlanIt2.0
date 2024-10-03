// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Hub.css';
import profileImage from '../assets/profile.png';

function Hub() {
    const [cards, setCards] = useState([

    ]);

    const addNewCard = () => {
        const newCard = {
            id: cards.length + 1,
            title: `Card ${cards.length + 1}`,
            description: `This is card ${cards.length + 1}`
        };
        setCards([...cards, newCard]);
    };

    return (
        <div className="hub-container">
            <div className="hub-nav-top">
                <div className="hub-nav-left">
                    <NavLink to="/home" className="home">Home</NavLink>
                    <NavLink to="/teams" className="teams">Teams</NavLink>
                    <NavLink to="/projects" className="projects">Projects</NavLink>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="hub-nav-right">
                    <NavLink to="/settings" className="settings">Settings</NavLink>
                    <button className="profile" style={{ backgroundImage: `url(${profileImage})` }}></button>
                </div>
            </div>


            <div className="card-container">
                {cards.map(card => (
                    <div className="card" key={card.id}>
                        <div className="card-content">
                            <h4>{card.title}</h4>
                            <p>{card.description}</p>
                            <button className="card-button">View More</button>
                        </div>
                    </div>
                ))}
                <div className="card add-card" onClick={addNewCard}>
                    <h4>+</h4>
                    <p>Add New Card</p>
                </div>
            </div>
        </div>
    );
}

export default Hub;
