// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom'; //To navigate to other pages in the app
import { NavLink } from 'react-router-dom';
import '../styles/Hub.css';
import profileImage from '../assets/profile.png';
import logoImage from '../assets/logo.png';
import { FaCog, FaEnvelope } from 'react-icons/fa'; // Import the gear icon
import { jwtDecode } from 'jwt-decode'; //To decode userId from token
import axios from 'axios';
import '../styles/Dropdown.css';
import Dropdown from 'react-bootstrap/Dropdown';
import { SketchPicker } from 'react-color';
import { Dropbox } from 'dropbox';

function Hub() {
    const [cards, setCards] = useState([]);
    const [openModal, setOpenModal] = useState(false)
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [token, setToken] = useState();
    const [userId, setUserId] = useState();
    const [user, setUser] = useState();
    const [ownedPlanets, setOwnedPlanets] = useState();
    const [collaboratedPlanets, setCollaboratedPlanets] = useState();
    const [newCardTitle, setNewCardTitle] = useState("Enter Title");
    const [newCardDesc, setNewCardDesc] = useState("Enter Description");
    const maxCards = 15; // Set the maximum number of cards
    const navigate = useNavigate();
    const [wcolor, setWcolor] = useState('#FFFFFF');
    const [theme, setTheme] = useState();
    const onClose = () => setOpenModal(false);
    const [pfp, setPfp] = useState('/');
    const dbx = new Dropbox({
        accessToken: "sl.CCci3gXmyVZumwbS0DBdl9Wc5a95VSz3oSwLzRll2jQJhrMJve1_M56EQwDxZoBLmHsrG4Un68EDecWtb9zCs5-pO7yYq4zx6s7aeOjUOzpzY87O0Qj5mIs3uBiF6iKws6RX4Exohuqc",
        fetch: fetch.bind(window)
    });
    const [isInviteModalOpen, setInviteModalOpen] = useState(false); // State for invite modal
    const [invites, setInvites] = useState([]); // State for invites

    const handleInviteModalOpen = () => {
        setInviteModalOpen(true);
    };

    const handleInviteModalClose = () => {
        setInviteModalOpen(false);
    };

    const InviteModal = ({ open, onClose, invites }) => {
        if (!open) return null;
        return (
            <div onClick={onClose} className='custom-modal-overlay'>
                <div onClick={(e) => e.stopPropagation()} className='custom-modal-content'>
                    <div className="modalRight">
                        <p onClick={onClose} className="closeBtn">X</p>
                        <div className="mailbox">
                            <h2>Mailbox</h2>
                            <ul className="invite-list">
                                {invites.map((invite) => (
                                    <li key={invite._id} className="invite-item">
                                        <span>Sender: {invite.invitingUserEmail}</span>
                                        <span>Planet Name: {invite.planetName}</span>
                                        <button onClick={() => handleAcceptInvite(invite._id)}>Accept</button>
                                        <button onClick={() => handleDeclineInvite(invite._id)}>Decline</button>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/users/${userId}/invites`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setInvites(res.data.invites);
            } catch (error) {
                console.error("Error fetching invites:", error);
            }
        };
        if (userId) {
            fetchInvites();
        }
    }, [userId, token]);

    //Grab token from local storage
    useEffect(() => {
        try {
            if (!localStorage.getItem('token'))
            {
                navigate('/'); //Redirect to login
            }
            setToken(localStorage.getItem('token'));
        }
        catch {
            navigate('/'); //Redirect to login
        }
    }, []);

    //Decode user id from token
    useEffect(() => {
        if (token)
        {
            try {
                var decoded = jwtDecode(token);
                setUserId(decoded.userId);
            } catch {
                navigate('/'); //Navigate to login
            }
        }
    }, [token]);

    //Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            let res = null;
            try {
                res = await axios.get(`http://localhost:3000/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) 
            {
                //Response and status code were returned from server
                if (error.response?.status) 
                {
                    alert(error.response.data.message);
                    console.error(error.response);
                    navigate('/');
                }
                //Request succeeded but received no response
                else if (!error.response && error.request)
                {
                    alert("There was an error retrieving user data. Contact support or try again later.");
                    console.error(error.response);
                    navigate('/');
                }
                //Client-side error in setting up the request
                else 
                {
                    alert("Client error. Contact support or try again later.");
                    console.error(error.message);
                    navigate('/');
                }
            }
            
            if (res?.data?.user)
            {
                setUser(res.data.user);
            }
            else {
                alert("There was an error retreiving user data. Contact support or try again later.");
                navigate('/');
            }
        };
        if (userId)
        {
            fetchUserData();
        }
    }, [userId]); // useEffect hooks runs when userId changes

    //Fetch all planets for user
    useEffect(() => {
        const fetchUserPlanets = async () => {
            let res = null;
            try {
                res = await axios.get(`http://localhost:3000/users/${userId}/planets`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) 
            {
                //Response and status code were returned from server
                if (error.response) 
                {
                    alert(error.response.data.message);
                    console.error(error.response);
                    navigate('/');
                }
                //Request succeeded but received no response
                else if (error.request)
                {
                    alert("There was an error retrieving user's planets. Contact support or try again later.");
                    console.error(error.response);
                    navigate('/');
                }
                //Client-side error in setting up the request
                else 
                {
                    alert("Client error in retrieving user's planets. Contact support or try again later.");
                    console.error(error.message);
                    navigate('/');
                }
            }
            
            if (res?.data?.ownedPlanets && res?.data?.collaboratedPlanets)
            {
                setOwnedPlanets(res.data.ownedPlanets);
                setCollaboratedPlanets(res.data.collaboratedPlanets);

                //Add cards for each planet returned
                res.data.ownedPlanets.forEach((planet) => {
                    //If planet is not already in array of cards
                    if (!cards.some(card => card.id == planet._id))
                    {
                        addCard(planet);
                    }
                });
                res.data.collaboratedPlanets.forEach((planet) => {
                    if (!cards.some(card => card.id == planet._id))
                    {
                        addCard(planet);
                    }
                });
            }
            else {
                alert("There was an error retrieving user's planets. Contact support or try again later.");
                navigate('/');
            }
        };
        if (user)
        {
            fetchUserPlanets();
        }            
    }, [user]); // useEffect hooks runs when user changes


    async function fetchPfp(url) {
        let res = await dbx.filesDownload({
            path: `/profile-pictures/${url}`
        });
        setPfp(URL.createObjectURL(res.result.fileBlob));
    }

    useEffect(() => {
        if (user)
        {
            fetchPfp(user.pfpLink);
        }
    }, [user]);

    //Post new planet information to database
    async function createPlanet()
    {
        if (newCardTitle == "Enter Title")
        {
            alert("You must enter a title before creating a new planet.");
        }
        else if (newCardDesc == "Enter Description")
        {
            alert("You must enter a description before creating a new planet.");
        }
        else if (newCardTitle.length > 20 || newCardTitle.length < 1)
        {
            alert("Title must be between 1 and 20 characters.");
        }
        else if (newCardDesc.length > 50 || newCardDesc.length < 1)
        {
            alert("Description must be between 1 and 50 characters");
        }
        else
        {
            let res = null;
            try 
            {
                res = await axios.post(`http://localhost:3000/planets`, 
                    {
                        name: newCardTitle,
                        description: newCardDesc,
                        ownerId: userId,
                        color: wcolor,
                        theme: theme
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            }
            catch (error) 
            {
                //Response and status code were returned from server
                if (error.response) 
                { 
                    //429 is returned when duplicate requests are quickly submitted, this can be ignored
                    if (error.response.status != 429)
                    {
                        alert(error.response.data.message);
                        console.error(error.response);
                    }
                }
                //Request succeeded but received no response
                else if (error.request)
                {
                    alert("There was an error creating a new planet. Contact support or try again later.");
                    console.error(error.response);
                }
                //Client-side error in setting up the request
                else 
                {
                    alert("Client error in creating planet. Contact support or try again later.");
                    console.error(error.message);
                }
            }

            if (res?.data?.planet)
            {
                addCard(res.data.planet); //Add new planet to cards
            }  
            setCards(prevCards => prevCards.filter(card => card.id !== -1)); //Remove add planet card
            //Reset values for future new card
            setNewCardTitle("Enter Title");
            setNewCardDesc("Enter Description");
        }
    }

    //Accept Invite

    const handleAcceptInvite = async (inviteId) => {
        try {
            await axios.post(`http://localhost:3000/invites/${inviteId}/accept`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setInvites(prevInvites => prevInvites.filter(invite => invite._id !== inviteId));
            alert("Invite accepted successfully!");
        } catch (error) {
            console.error("Error accepting invite:", error);
            alert("There was an error accepting the invite. Please try again later.");
        }
    };

    const handleDeclineInvite = async (inviteId) => {
        try {
            await axios.post(`http://localhost:3000/invites/${inviteId}/decline`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setInvites(prevInvites => prevInvites.filter(invite => invite._id !== inviteId));
            alert("Invite declined successfully!");
        } catch (error) {
            console.error("Error declining invite:", error);
            alert("There was an error declining the invite. Please try again later.");
        }
    };


    //Adds a card of given planet to list
    const addCard = (planet) => {
        if (cards.length < maxCards) { 
            const newCard = { 
                id: planet._id,
                title: planet.name,
                description: planet.description,
                imageUrl: 'https://via.placeholder.com/150' // Placeholder image URL
            };
            setCards(prevCards => [...prevCards, newCard]);
        }
        else {
            alert('Maximum number of cards reached');
        }
    }; 
    
    //Creates a placeholder card for user to enter title and description of new planet
    function addNewPlanetCard()
    {
        if (cards.length < maxCards && !cards.some(card => card.id == -1))
        {
            const placeholder = {
                id: -1, //Temporary id
                title: newCardTitle,
                description: newCardDesc,
                imageUrl: 'https://via.placeholder.com/150'
            };

            setCards(prevCards => [...prevCards, placeholder]);
        } 
    }

    function handleDescChange(e)
    {
        if (e.target.value.length <= 50)
        {
            setNewCardDesc(e.target.value);
        }
    }
    function handleTitleChange(e)
    {
        if (e.target.value.length <= 20)
        {
            setNewCardTitle(e.target.value);
        }
    }

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleCreatePlanetAndClose = () => {
        createPlanet();
        onClose();
    };

    const ColorPicker = () => {
      
        // Function to handle color change
        const handleChange = (newColor) => {
          setWcolor(newColor.hex); // Save the color to the wcolor state
        };
      
        // Function to move the preset colors section out of the SketchPicker
        useEffect(() => {
          const presetColors = document.querySelector('.sketch-picker .flexbox-fix:last-child');
          if (presetColors) {
            presetColors.style.position = 'absolute';
            presetColors.style.top = '0';
            presetColors.style.left = '100%';
            presetColors.style.transform = 'rotate(90deg) translateX(150px) translateY(63.5px)';
            presetColors.style.width = '185px';
            presetColors.style.border = '1px solid #d9d9d9';
            presetColors.style.borderRadius = '5px';
            presetColors.style.paddingLeft = '15px';
          }
      }, []);
      
      const presetColors = [
        '#000000', '#00FF00', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0',
        '#FFFFFF', '#FF0000', '#0000FF', '#B8E900', '#FF00FF', '#4A4A4A', '#9B9B9B'
      ];
      
        return (
          <div className="sketchpicker-container">
            <div
              className="colorPreview"
              style={{
                backgroundColor: wcolor,
              }}
            />
            {/* Always render the SketchPicker */}
            <SketchPicker
              color={wcolor}
              onChange={handleChange}
              className="sketch-picker" // Add custom class
              presetColors={presetColors}
            />

          </div>
        );
      };

    const Modal = ({open,onClose, createPlanet}) => {
        
        console.log("model opened");
        if(!open) return null
        return(
            <div onClick={onClose} className='backblur'>
                <div onClick={(e) => {
                    e.stopPropagation()
                }}className='modalContainer'>
                    <div className="modalRight">
                        <p onClick={onClose} className="closeBtn">X</p>
                        <div className="content">
                            <ThemeDrop/>
                            <ColorPicker/>
                        </div>
                        <div className="btnContainer">
                            <button className='btnPrimary' onClick={handleCreatePlanetAndClose}>
                                <span className='bold'>YES PLEASE</span> 
                            </button>
                            <button onClick={onClose} className='btnOutline'>
                                <span  className='bold'>NO THANKS</span> 
                            </button>
                        </div>
                    </div>
                </div>
    
            </div>
        )
    }
      

    function ThemeDrop() {
        const [showMenu, setShowMenu] = useState(false);
      
        const handleToggle = (isOpen) => {
          setShowMenu(isOpen);
        };

        const themes = {
            'Theme 1': ['#3e204f', '#5a4565', '#cec9d6', '#e2dbe9', '#bcaecc'],
            'Theme 2': ['#ffa2a2', '#9f917b', '#c5b88f', '#f9f0f0', '#aaaaaa'],
            'Theme 3': ['#424853', '#ff7b7b', '#cccccc', '#bbbbbb', '#aaaaaa'],
            'None': []
        };
      
        return (
          <Dropdown className="dropdown" show={showMenu} onToggle={handleToggle}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Theme Picker ▼
            </Dropdown.Toggle>
      
            <Dropdown.Menu className={`dropdown-menu ${showMenu ? 'show' : ''}`}>
              <Dropdown.Item onClick={() => setTheme(themes['Theme 1'])}>Theme 1</Dropdown.Item>
              <Dropdown.Item onClick={() => setTheme(themes['Theme 2'])}>Theme 2</Dropdown.Item>
              <Dropdown.Item onClick={() => setTheme(themes['Theme 3'])}>Theme 3</Dropdown.Item>
              <Dropdown.Item onClick={() => setTheme('Null')}>None</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );
    }

    return (
        <div className="hub-container">
            <div className="hub-nav-top">
                <div className="hub-nav-left">
                    <NavLink to="/home" className="home">
                        <img src={logoImage} alt="Logo" className="logo-image" />
                    </NavLink>
                    <NavLink to="/teams" className="teams">Teams</NavLink>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="hub-nav-right">
                    <FaEnvelope className="mailbox-icon" onClick={handleInviteModalOpen} />
                    <NavLink to="/settings" className="settings">
                        <FaCog className="settings-icon" />
                    </NavLink>                    <div className="profile" onClick={toggleDropdown}>
                        <img src={pfp} alt="Profile" className="profile-image" />
                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="profile-header">
                                    <span className="profile-name">{user.fName} {user.lName}</span>
                                    <span className="profile-email">{user.email}</span>
                                </div>
                                <div className="profile-options">
                                    <NavLink to="/quickstart">Open Quickstart</NavLink>
                                    <NavLink to="/profile">Profile</NavLink>
                                    <NavLink to={`/users/${userId}/settings`}>Personal settings</NavLink>
                                    <NavLink to="/notifications">Notifications</NavLink>
                                    <NavLink to="/theme">Theme</NavLink>
                                    <NavLink to="/logout">Log out</NavLink>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <InviteModal open={isInviteModalOpen} onClose={handleInviteModalClose} invites={invites} />

            <div className="card-container">
                    {cards.map(card => (
                            <div className="card" key={card.id}>
                                <img src={card.imageUrl} alt={card.title} className="card-image" />
                                <div className="card-content">
                                    {card.id != -1 ? (
                                        <>
                                            <h4>{card.title}</h4>   
                                            <p>{card.description}</p>
                                            <button className="card-button"><a href={`/planets/${card.id}`}>Visit</a></button>
                                        </>
                                    ) : (
                                        <>
                                            <input 
                                                className="card-input-title"
                                                type="text"
                                                value={newCardTitle}
                                                minLength={1}
                                                maxLength={20}
                                                onChange={(e) => handleTitleChange(e)}
                                            /> 
                                            <input
                                                className="card-input-desc"
                                                type="text"
                                                value={newCardDesc}
                                                minLength={1}
                                                maxLength={50}
                                                onChange={(e) => handleDescChange(e)}
                                            />
                                            <button className="card-button" onClick={() => setOpenModal(true)}>Create</button>
                                            <Modal open={openModal}onClose={()=> setOpenModal(false)}/>
                                                
                                        </>
                                    )}
                                </div>
                            </div>
                    ))}
                    {cards.length < maxCards && (
                        <div className="card add-card" onClick={addNewPlanetCard}>
                            <h4>+</h4>
                            <p>Create Planet</p>
                        </div>
                    )}
            </div>
        </div>
    );

    }

export default Hub;
