import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { NavLink } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import profileImage from '../assets/profile.png';
import logoImage from '../assets/logo.png';
import '../styles/PlanIT.css';

// Initial columns for the board
const initialColumns = {
  backlog: [],
  inprogress: [],
  todo: [],
  completed: [],
};

function PlanIT() {
  // State for the columns on the board
  const [columns, setColumns] = useState(initialColumns);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const sourceColumn = Object.keys(columns).find((column) =>
      columns[column].some((item) => item.id === active.id)
    );
    const destinationColumn = over.id;

    // Move the card to the new column
    if (sourceColumn !== destinationColumn) {
      const sourceItems = Array.from(columns[sourceColumn]);
      const destinationItems = Array.from(columns[destinationColumn]);

      const [movedItem] = sourceItems.splice(
        sourceItems.findIndex((item) => item.id === active.id),
        1
      );
      destinationItems.push(movedItem);

      setColumns({
        ...columns,
        [sourceColumn]: sourceItems,
        [destinationColumn]: destinationItems,
      });
    }
  };

  // Add a new card to the specified column
  const addCard = (columnId) => {
    const newCardContent = prompt("Enter new card content:");
    if (newCardContent) {
      const newCard = {
        id: Date.now().toString(), // Unique ID based on timestamp
        content: newCardContent,
      };
      setColumns({
        ...columns,
        [columnId]: [...columns[columnId], newCard],
      });
      if (newCardContent.length > 25) {
        alert('Card content is too long. Please keep it under 25 characters.');
        setColumns({
          ...columns,
          [columnId]: columns[columnId].filter((card) => card.id !== newCard.id),
        });
      }
    }
  };

  // Edit the content of a card
  const editCard = (columnId, cardId) => {
    const updatedContent = prompt("Edit card content:");
    if (updatedContent) {
      setColumns({
        ...columns,
        [columnId]: columns[columnId].map((card) =>
          card.id === cardId ? { ...card, content: updatedContent } : card
        ),
      });
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
          <NavLink to="/settings" className="settings">
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

      {/* Board */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="board">
          {Object.keys(columns).map((columnId) => (
            <Column
              key={columnId}
              id={columnId}
              items={columns[columnId]}
              addCard={addCard}
              editCard={editCard}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

// Column component
function Column({ id, items, addCard, editCard }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h3>{id.toUpperCase()}</h3>
      <div className="cards-container">
        {items.map((item) => (
          <DraggableCard
            key={item.id}
            id={item.id}
            content={item.content}
            onDoubleClick={() => editCard(id, item.id)}
          />
        ))}
      </div>
      <button className="add-card-button" onClick={() => addCard(id)}>
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
      onDoubleClick={onDoubleClick}
    >
      {content}
    </div>
  );
}

export default PlanIT;
