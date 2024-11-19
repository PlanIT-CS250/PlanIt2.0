import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import '../styles/ColorPicker.css';

const ColorPicker = () => {
  // State to manage the color
  const [color, setColor] = useState({ r: 0, g: 0, b: 0, a: 1 });

  // Function to handle color change
  const handleChange = (newColor) => {
    setColor(newColor.rgb);
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
  //48 

  // Define the preset colors with one color removed
  const presetColors = [
    '#000000', '#00FF00', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0',
    '#FFFFFF', '#FF0000', '#0000FF', '#B8E900', '#FF00FF', '#4A4A4A', '#9B9B9B'
  ];

  return (
    <div className="sketchpicker-container">
      {/* Div to display the color preview */}
      <div
        className="colorPreview"
        style={{
          backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        }}
      />
      {/* Always render the SketchPicker */}
      <SketchPicker
        color={color}
        onChange={handleChange}
        className="sketch-picker" // Add custom class
        presetColors={presetColors} // Set the preset colors
      />
    </div>
  );
};

export default ColorPicker;