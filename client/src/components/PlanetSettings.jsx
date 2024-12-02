import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; //To navigate to other pages in the app
import { jwtDecode } from 'jwt-decode'; //To decode userId from token

function PlanetSettings() {
    const { planetId } = useParams();
    const [token, setToken] = useState();
    const [userId, setUserId] = useState();
    const [user, setUser] = useState();
    const [planet, setPlanet] = useState({ name: '', description: ''});
    const [planetCollaborators, setPlanetCollaborators] = useState();
    const navigate = useNavigate();

    //Grab token from local storage
    useEffect(() => {
        try {
            //If token not found, navigate to hub
            if (!localStorage.getItem('token')) 
            {
                navigate('/');
            }
            setToken(localStorage.getItem('token'));
        }
        catch (error) {
            navigate('/'); 
        }
    }, []);

//Decode user id from token
useEffect(() => {
  const decodeToken = () => {
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    } catch (error) {
      navigate('/'); 
      console.log(error);
  }
  };
  if (token)
  {
    decodeToken();
  }
}, [token]);

//Fetch user data
useEffect(() => {
  const fetchUserData = async () => {
      try {
          const res = await axios.get(`http://localhost:3000/users/${userId}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          setUser(res.data.user);

      //If user not found, navigate to login
      } catch (error) {
          navigate('/'); 
      }
  };
  if (userId)
  {
      fetchUserData();
  }
}, [userId]);

//Fetch planet
useEffect(() => {
  const fetchPlanet = async () => {
    let res = null;
    try {
        res = await axios.get(`http://localhost:3000/planets/${planetId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error)
    {
      if (error.response) {
        //Server returned 4xx or 5xx status code
        alert(error.response.data.message);
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        //Request was made but recieved no response from server
        alert("Internal server error. Contact support or try again later.")
        console.error(error.request);
      } else {
        //Request was set up incorrectly
        alert("There was an error retrieving this planet. Please try again later.");
        console.error(error.message);
      }
    }
    if (res?.data?.planet && res?.data?.collaborators) {
      setPlanet(res.data.planet);
      setPlanetCollaborators(res.data.collaborators);
    }
    else {
      navigate("/hub");
    }
  };
  if (user) {
    fetchPlanet();
  }
}, [user]);


    return (
        <div className="settingsContainer">
            <h1>Planet Settings</h1>
            <div className="nameDescription">  
                <h2>{planet.name}</h2>
                <input 
                type="text" 
                placeholder="Planet Name"
                />
                <h2>{planet.description}</h2>
                <input 
                type="text" 
                placeholder="Planet Description" />
            </div>
        </div>
    )

}
export default PlanetSettings;