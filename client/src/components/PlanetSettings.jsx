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
    const [email, setEmail] = useState();
    const [name, setName] = useState();
    const [description, setDescription] = useState();
    const [planet, setPlanet] = useState({ name: '', description: ''});
    const [planetCollaborators, setPlanetCollaborators] = useState([]);
    const navigate = useNavigate();

    const handleNameChange = (e) => {
      setName(e.target.value);
    }

    const handleDescriptionChange = (e) => {
      setDescription(e.target.value);
    }

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

async function sendInvite(userEmail)
{
  try
  {
      console.log('Sending invite', userEmail);
      const res = await axios.post(`http://localhost:3000/planets/${planetId}/invite`, { userEmail },
      {
      headers: {
          'Authorization': `Bearer ${token}`
      }
      }
      );
  }
  catch(error)
  {
      console.log(error);
  }
}

const handleEmailChange = (e) => {
  setEmail(e.target.value);
}

function submitInvite() {
  sendInvite(email);
}

async function kickUser(userId)
{
  try
  {
      console.log('Kicking user', userId);
      const res = await axios.delete(`http://localhost:3000/planets/${planetId}/users/${userId}`,
      {
      headers: {
          'Authorization': `Bearer ${token}`
      }
      }
      );
  }
  catch(error)
  {
      console.log(error);
  }
}

async function updatePlanet(name, description)
{
  try
  {
      console.log('Updating planet', name, description);
      const res = await axios.put(`http://localhost:3000/planets/${planetId}`, {name, description},
      {
      headers: {
          'Authorization': `Bearer ${token}`
      }
      }
      );
      console.log(res);
  }
  catch(error)
  {
      console.log(error);
  }
}

async function promoteUser(userId)
{
  try
  {
      console.log('Promoting user', userId);
      const res = await axios.put(`http://localhost:3000/planets/${planetId}/users/${userId}/promote`,
      {
      headers: {
          'Authorization': `Bearer ${token}`
      }
      }
      );
  }
  catch(error)
  {
      console.log(error);
  }
}

return (
  <div className="pSettingsContainer">
    {/*left side content*/}
    <div className="leftSide">
      <h1>Planet Settings</h1>
      <div className="nameDescription">
        <h2>{planet.name}</h2>
        <input 
          type="text" 
          placeholder="Planet Name"
          onChange={handleNameChange}
          value={name}
        />
        <h2>{planet.description}</h2>
        <input 
          type="text" 
          placeholder="Planet Description"
          onChange={handleDescriptionChange}
          value={description}
        />
        <button onClick={() => updatePlanet(name, description)} className="submit" >Submit</button>
      </div>

      <div className="collaborators">
        <h2>Collaborators</h2>
        <ul className="collabName">
          {/*displays all collaborators*/}
          {planetCollaborators
            .filter(collaborator => collaborator.role !== 'owner')
            .map(collaborator => (
              <li key={collaborator._id}>
                {collaborator.username}
                <button onClick={() => promoteUser(collaborator._id)} className="promoteButton">Promote</button>
                <button onClick={() => kickUser(collaborator._id)} className="kickButton">Kick</button>
              </li>
            ))}
        </ul>
      </div>
    </div>
    {/*line down the middle*/}
    <div className="center"></div>
    {/*right side content*/}
    <div className="rightSide">
      <div className="customization">
        <h2></h2>
        <h2>
          Color:  {planet.color}
      <input
        type="color"
        value={planet.color}
        style={{
          display: 'inline-block',
          width: '30px',
          height: '40px',
          marginLeft: '0px',
          position: 'relative',
          bottom: '-3px',
          background: 'none'
        }}
      />

        </h2>

        <h2/>

      </div>

      <div className='line'>
        <hr/>
      </div>

      <div className='invite'>
        <h2>Invite Collaborators</h2>
        <input 
          type="text" 
          placeholder="exampleEmail@gmail.com"
          onChange={handleEmailChange}
        />
        <button onClick={submitInvite} className="submit" >Submit</button>
      </div>

      <div className="deleteButton">
        <button>Delete Project</button>
      </div>
    </div>
  </div>
);

}
export default PlanetSettings;