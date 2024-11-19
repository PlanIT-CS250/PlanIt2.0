import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import '../styles/Dropdown.css';

function ThemeDrop() {
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = (isOpen) => {
    setShowMenu(isOpen);
  };

  return (
    <Dropdown className="dropdown" show={showMenu} onToggle={handleToggle}>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Theme Picker ▼
      </Dropdown.Toggle>

      <Dropdown.Menu className={`dropdown-menu ${showMenu ? 'show' : ''}`}>
        <Dropdown.Item>Theme 1</Dropdown.Item>
        <Dropdown.Item>Theme 2</Dropdown.Item>
        <Dropdown.Item>Theme 3</Dropdown.Item>
        <Dropdown.Item>None</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ThemeDrop;