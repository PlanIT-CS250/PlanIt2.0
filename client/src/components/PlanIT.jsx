import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom' //To access the url parameters
import { useNavigate } from 'react-router-dom'; //To navigate to other pages in the app
import { FaCog } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode'; //To decode userId from token
import profileImage from '../assets/profile.png';
import logoImage from '../assets/logo.png';
import '../styles/PlanIT.css';
import axios from 'axios';
import Modal from 'react-modal';

function PlanIT() {
  // State for the columns on the board
  const [columns, setColumns] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [token, setToken] = useState();
  const [userId, setUserId] = useState();
  const [user, setUser] = useState();
  const [planet, setPlanet] = useState();
  const [planetCollaborators, setPlanetCollaborators] = useState();
  const { planetId } = useParams(); //Id passed in url parameters
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  //Grab token from local storage
  useEffect(() => {
    try {
        //If token not found, navigate to hub
        if (!localStorage.getItem('token'))
        {
            navigate('/hub');
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
  if (user)
  {
    fetchPlanet();
  }
}, [user]);

const fetchColumns = async () => {
  let res = null;
  try {
    res = await axios.get(`http://localhost:3000/planets/${planetId}/columns`, {
      headers: {
          'Authorization': `Bearer ${token}`
      }
    });
  } 
  catch (error) 
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
      alert("There was an error retrieving this planet's columns and tasks. Please try again later.");
      console.error(error.message);
    }
  }
  if (res?.data?.columns)
  {
    const planetColumns = res.data.columns;
    const columns = [];

    //Iterate through planet's columns
    planetColumns.forEach(planetColumn => {
      const tasks = [];
      //Add tasks to each column
      planetColumn.tasks.forEach(planetTask => {
        //Add data to task
        const taskObj = {};
        taskObj.id = planetTask._id;
        taskObj.content = planetTask.content;
        tasks.push(taskObj); //Push task to list of tasks in column
      });
      //Push column to list of columns
      columns.push({
        id: planetColumn._id,
        name: planetColumn.name,
        tasks: tasks
      });
    });
    //Display columns and tasks
    setColumns(columns);
  }
  else {
    navigate("/hub");
  }
}

//Fetch all columns and their tasks for planet
useEffect(() => {
  if (planet)
  {
    fetchColumns();
  }
}, [planet]);

//Saves a new column to database
async function createColumn(name)
{
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
  } 
  catch (error)
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
      alert("There was an error creating a new column. Please try again later.");
      console.error(error.message);
    }
  }

}

//Prompt the user for a column name, then saves the new column to database
async function promptCreateColumn()
{
  const name = prompt("Enter column name:");
  if (name.length < 1 || name.length > 15)
  {
    alert("Column name must be between 1 and 15 characters.");
    return;
  }
  
  await createColumn(name);
  await fetchColumns();
}

//Saves a new task to database
async function createTask(columnId, content)
{
  try 
  {
    const res = await axios.post(`http://localhost:3000/planets/columns/${columnId}/task`, 
      {
        columnId,
        content
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
      alert("There was an error creating a new task. Please try again later.");
      console.error(error.message);
    }
  } 
}

//Prompts a user for task content, then saves the new task to database
async function promptCreateTask(columnId)
{
    const content = prompt("Enter new card content:");
    if (content?.length <= 30 && content?.length >= 1)
    {
      await createTask(columnId, content);
      await fetchColumns();
    }
    else {
      alert("Task content must be between 1 and 30 characters.");
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

  if (!over || active.id === over.id) return; // Exit if no drop target or no change

  const sourceColumn = columns.find((column) =>
    column.tasks.some((task) => task.id === active.id)
  );

  const destinationColumn = columns.find((column) =>
    column.tasks.some((task) => task.id === over.id)
  );

  if (!sourceColumn || !destinationColumn) return; // Exit if either column is not found


  // If sorting within the same column
  if (sourceColumn.id === destinationColumn.id) {
    const columnIndex = columns.findIndex((column) => column.id === sourceColumn.id);

    const updatedTasks = arrayMove(
      sourceColumn.tasks,
      sourceColumn.tasks.findIndex((task) => task.id === active.id),
      sourceColumn.tasks.findIndex((task) => task.id === over.id)
    );

    // Update state with reordered tasks
    const updatedColumns = [...columns];
      updatedColumns[columnIndex] = { 
      ...sourceColumn,
      tasks: updatedTasks 
    };

    setColumns(updatedColumns); // Persist new state

    //Send request to server to update task
    updateTask(active.id, { order: updatedTasks.map(task => task.id).indexOf(active.id) + 1 });

    return;
  }

  // If moving task between different columns
  const sourceColumnIndex = columns.findIndex((column) => column.id === sourceColumn.id);
  const destinationColumnIndex = columns.findIndex((column) => column.id === destinationColumn.id);

  const sourceTasks = [...sourceColumn.tasks];
  const [movedTask] = sourceTasks.splice(
    sourceTasks.findIndex((task) => task.id === active.id),
    1
  );

  const destinationTasks = [...destinationColumn.tasks];
  destinationTasks.splice(
    destinationTasks.findIndex((task) => task.id === over.id),
    0,
    movedTask
  );

  // Update state with moved tasks
  const updatedColumns = [...columns];
  updatedColumns[sourceColumnIndex] = { ...sourceColumn, tasks: sourceTasks };
  updatedColumns[destinationColumnIndex] = { ...destinationColumn, tasks: destinationTasks };

  setColumns(updatedColumns); // Persist new state

  //Send request to server to update task
  updateTask(active.id, { order: destinationTasks.indexOf(movedTask) + 1, columnId: destinationColumn.id });
};

  //Edits the content of a card
// const editCardContent = (columnId, taskId) => {
//     const updatedContent = prompt("Edit task content:");
//     if (updatedContent.length >= 1 && updatedContent.length <= 30) {
//       updateTask(taskId, { content: updatedContent });
//     }
//     else {
//       alert("Task content must be between 1 and 30 characters");
//     }
// };

  // Function to open the modal
const openModal = (card) => {
  setSelectedCard(card);
  setIsModalOpen(true);
};

// Function to close the modal
const closeModal = () => {
  setIsModalOpen(false);
  setSelectedCard(null);
};

// Function to handle card updates
const handleCardUpdate = (updatedDetails) => {
  updateTask(selectedCard.id, updatedDetails);
  closeModal();
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
          <NavLink to={`/planets/${planetId}/settings/`} className="settings">
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
      <button onClick={() => promptCreateColumn()}>Add column</button>
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
              editCardContent={(id, taskId) => openModal({ id: taskId, content: columns.find(col => col.id === id).tasks.find(task => task.id === taskId).content })}
              />
          ))}
        </div>
      </DndContext>
      <CardModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        card={selectedCard}
        updateTask={updateTask}
      />
    </div>
  );
}

// Column component
function Column({ id, name, items, createTask, editCardContent }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h3>{name}</h3>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
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
      </SortableContext>

      <button className="add-card-button" onClick={() => createTask(id)}>
        + Add Card
      </button>
    </div>
  );
}

function CardModal({ isOpen, onRequestClose, card, updateTask }) {
  const [content, setContent] = useState(card ? card.content : '');
  const [description, setDescription] = useState(card ? card.description : '');
  const [priority, setPriority] = useState(card ? card.priority : 1);

  useEffect(() => {
    if (card) {
      setContent(card.content);
      setDescription(card.description || '');
      setPriority(card.priority || 1);
    }
  }, [card]);

  const handleSave = () => {
    if (content.length >= 1 && content.length <= 30) {
      if (description.length >= 1 && description.length <= 500) {
        updateTask(card.id, { content, description, priority });
        onRequestClose();
      } else {
        alert("Task description must be between 1 and 500 characters.");
      }
    } else {
      alert("Task content must be between 1 and 30 characters");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="custom-modal-content"
      overlayClassName="custom-modal-overlay"
    >
      <textarea 
        className="title-content" 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
      />
      <label className="description-label">Description</label>
      <textarea 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
      />
      <label className="priority-label">Priority</label>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="1">1 - Low</option>
        <option value="2">2 - Medium</option>
        <option value="3">3 - High</option>
        <option value="4">4 - Critical</option>
      </select>
      <div>
        <button className="save-button" onClick={handleSave}>Save</button>
        <button className="cancel-button" onClick={onRequestClose}>Cancel</button>
      </div>
    </Modal>
  );
}

// Draggable card component
function DraggableCard({ id, content, onDoubleClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });


  // Style the card movement
  const style = {
    transform: CSS.Transform.toString(transform), // Safe transform values
    transition, // Smooth transitions
    zIndex: isDragging ? 1000 : 1, // Bring the dragged card to the top
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',   
  };

  return (
    //
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="card"
      onDoubleClick={onDoubleClick}
    >
      {content}
    </div>
  );
}


export default PlanIT;
