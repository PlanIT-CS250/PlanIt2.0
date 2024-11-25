import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom' //To access the url parameters
import { useNavigate } from 'react-router-dom'; //To navigate to other pages in the app
import { FaCog } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode'; //To decode userId from token
import profileImage from '../assets/profile.png';
import logoImage from '../assets/logo.png';
import '../styles/PlanIT.css';
import axios from 'axios';
import Modal from './Modal.jsx';

function PlanIT() {
  // State for the columns on the board
  const [columns, setColumns] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [token, setToken] = useState();
  const [userId, setUserId] = useState();
  const [user, setUser] = useState();
  const [planet, setPlanet] = useState();
  const [planetCollaborators, setPlanetCollaborators] = useState();
  const [tables, setTables] = useState([]);
  const { id } = useParams(); //Id passed in url parameters
  const planetId = id;
  const navigate = useNavigate();

  //Grab token from local storage
  useEffect(() => {
    try {
        if (!localStorage.getItem('token'))
        {
            navigate('/hub'); //Redirect to hub
        }
        setToken(localStorage.getItem('token'));
    }
    catch {
      navigate('/hub'); 
    }
  }, []);

//Decode user id from token
useEffect(() => {
  const decodeToken = () => {
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    } catch {
      navigate('/hub'); 
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
      } catch (error) {
          navigate('/hub'); 
      }
  };
  if (userId)
  {
      fetchUserData();
  }
}, [userId]); // useEffect hooks runs when userId changes

//Fetch planet
useEffect(() => {
  const fetchPlanet = async () => {
      try {
          const res = await axios.get(`http://localhost:3000/planets/${planetId}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setPlanet(res.data.planet);
          setPlanetCollaborators(res.data.collaborators);

      } catch (error)
      {
        //Axios error
        if (typeof error.response.status != undefined)
        {
          if (error.response.status == 404 || error.response.status == 400)
          {
            alert("No planet found.");
          }
          else
          {
            navigate('/hub');
          }
        }
        //Non-axios error
        else
        {
          navigate("/hub");
        }
      }
  };
  if (user)
  {
    fetchPlanet();
  }
}, [user]);

const fetchColumns = async () => {
    const res = await axios.get(`http://localhost:3000/planets/${planetId}/columns`, {
      headers: {
          'Authorization': `Bearer ${token}`
      }
    });
  const planetColumns = res.data.columns;
  const columns = [];

  //Iterate through planet's columns
  planetColumns.forEach(planetColumn => {
    const tasks = [];
    //Add tasks to each column
    planetColumn.tasks.forEach(planetTask => {
      const taskObj = {};
      taskObj.id = planetTask._id;
      taskObj.content = planetTask.content;
      tasks.push(taskObj);
    });
    columns.push({
      id: planetColumn._id,
      name: planetColumn.name,
      tasks: tasks
    });
  });
  //Display columns and tasks
  setColumns(columns);
}

useEffect(() => {
  if (planet)
  {
    try {
      fetchColumns();
    }
    catch(error) {
      console.log(error);
    }
  }
}, [planet]);

async function createColumn()
{
  const name = prompt("Enter column name:");
  if (name.length < 1 || name.length > 15)
  {
    alert("Column name must be between 1 and 15 characters.");
    return;
  }
  
  try
  {
    const res = await axios.post(`http://localhost:3000/planets/${planet._id}/columns`, 
      {
          name
      },
      {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      }
  );
  fetchColumns();

  } catch(error) {
    console.log(error);
  }
}

async function createTask(columnId)
{
  try
  {
    const newCardContent = prompt("Enter new card content:");
    if (newCardContent && newCardContent.length <= 30 && newCardContent.length >= 1)
    {
      const res = await axios.post(`http://localhost:3000/planets/columns/${columnId}/task`, 
      {
        columnId,
        content: newCardContent
      },
      {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      }
      );
      fetchColumns();
    }
    else {
      alert("Task content must be between 1 and 30 characters.");
    }
  }
  catch(error)
  {
    console.log(error);
  }
}

async function updateTask(taskId, changes)
{
  try
  {
    const res = await axios.put(`http://localhost:3000/planets/tasks/${taskId}`, changes,
    {
      headers: {
          'Authorization': `Bearer ${token}`
      }
    }
    );
    fetchColumns();
  }
  catch(error)
  {
    console.log(error);
  }
}
  
const handleDragEnd = (event) => {
  const { active, over } = event;

  if (!over) return; // Exit if not hovering over a valid drop area

  // Find the source column (the column the item is being dragged from)
  const sourceColumn = columns.find((column) =>
    column.tasks.some((item) => item.id === active.id)
  );

  // Find the destination column (the column the item is being dropped onto)
  const destinationColumn = columns.find((column) => column.id === over.id);

  // Proceed if the source and destination columns are different
  if (sourceColumn && destinationColumn && sourceColumn.id !== destinationColumn.id) {
    // Create copies of the source and destination task arrays
    const sourceItems = Array.from(sourceColumn.tasks);
    const destinationItems = Array.from(destinationColumn.tasks);

    // Find the index of the moved item in the source column
    const [movedItem] = sourceItems.splice(
      sourceItems.findIndex((item) => item.id === active.id),
      1
    );

    // Add the moved item to the destination column
    destinationItems.push(movedItem);
    updateTask(movedItem.id, { columnId: destinationColumn.id });

    // Update the columns state
    /*setColumns((prevColumns) => 
      prevColumns.map((column) => {
        if (column.id === sourceColumn.id) {
          return { ...column, tasks: sourceItems }; // Update source column
        }
        if (column.id === destinationColumn.id) {
          return { ...column, tasks: destinationItems }; // Update destination column
        }
        return column; // Return other columns unchanged
      })
    );*/
  }
};

  //Edits the content of a card
  const editCardContent = (columnId, taskId) => {
    const updatedContent = prompt("Edit task content:");
    if (updatedContent.length >= 1 && updatedContent.length <= 30) {
      updateTask(taskId, { content: updatedContent });
    }
    else {
      alert("Task content must be between 1 and 30 characters");
    }
  };

  // The PlanIT page
  return (
    <div className="planit-page">
      {/* Navbar */}
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
          <NavLink to="/planetsettings" className="settings">
            <FaCog className="settings-icon" />
          </NavLink>
          <div className="profile" onClick={() => setDropdownOpen(!isDropdownOpen)}>
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
      <button onClick={() => createColumn()}>Add column</button>
      {/* Board */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="board">
          {columns.map((column) => ( 
            <Column
              key={column.id}
              id={column.id}
              name={column.name}
              items={column.tasks}
              createTask={createTask}
              editCardContent={editCardContent}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

// Column component
function Column({ id, name, items, createTask, editCardContent }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h3>{name}</h3>
      <div className="cards-container">
        {items.map((item) => (
          <DraggableCard
            key={item.id}
            id={item.id}
            content={item.content}
            onDoubleClick={() => editCardContent(id, item.id)}
          />
        ))}
      </div>
      <button className="add-card-button" onClick={() => createTask(id)}>
        + Add Card
      </button>
    </div>
  );
}

// Draggable card component
function DraggableCard({ id, content, onDoubleClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    position: isDragging ? 'absolute' : 'relative',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.15)',
    transition: isDragging ? 'none' : 'all 0.2s',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="card"
      onDoubleClick = {onDoubleClick}
    >
      {content}
    </div>
  );
}

export default PlanIT;
