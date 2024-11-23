import React from 'react';
import axios from 'axios';

function PlanetSettings() {

    return (
        <div className="settingsContainer">
            <h1>Planet Settings</h1>
            <div className="nameDescription">
                <h2>Planet Name</h2>
                <input 
                type="text" 
                placeholder="Planet Name"
                />
                <h2>Planet Description</h2>
                <input 
                type="text" 
                placeholder="Planet Description" />
            </div>
        </div>
    )

}
export default PlanetSettings;