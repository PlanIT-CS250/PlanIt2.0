import React from 'react';
import axios from 'axios';
import AvatarEditor from 'react-avatar-editor';

const accessToken = "sl.CCci3gXmyVZumwbS0DBdl9Wc5a95VSz3oSwLzRll2jQJhrMJve1_M56EQwDxZoBLmHsrG4Un68EDecWtb9zCs5-pO7yYq4zx6s7aeOjUOzpzY87O0Qj5mIs3uBiF6iKws6RX4Exohuqc";

// Submits an image (base64) to the dropbox folder
async function submitImage(base64Image, fileName)
{
    // Convert Base64 image string to a Blob
    const base64Data = base64Image.split(',')[1]; // Remove the "data:image/png;base64," prefix if present
    const binaryData = atob(base64Data); // Decode Base64
    const byteArray = new Uint8Array(binaryData.length);

    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    const response = await axios.post(
      'https://content.dropboxapi.com/2/files/upload',
      blob, // File content as the request body
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Access token
          'Dropbox-API-Arg': JSON.stringify({
            path: `/profile-pictures/${fileName}`, // Target path in Dropbox (e.g., /folder/image.png)
            mode: 'add',
            autorename: true,
            mute: false
          }),
          'Content-Type': 'application/octet-stream' // Binary file format
        }
      }
    );
    console.log(response);

}
class UploadImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            fileName: null,
            allowZoomOut: false,
            position: { x: 0.5, y: 0.5 },
            scale: 1,
            rotate: 0,
            borderRadius: 50,
            preview: null,
            width: 300,
            height: 300,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleNewImage = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                this.setState({ 
                    image: event.target.result,
                    fileName: file.name
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    handleScale = (e) => {
        const scale = parseFloat(e.target.value);
        this.setState({ scale });
    };

    handlePositionChange = (position) => {
        this.setState({ position });
    };

    setEditorRef = (editor) => {
        this.editor = editor;
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        if (this.editor) {
            const canvas = this.editor.getImageScaledToCanvas().toDataURL();
            this.setState({ preview: canvas });

            try {
                // Make put request to localhost:3000/users/:userId
            }
            catch (error) {

            }

            submitImage(this.state.image, this.state.fileName); // Run if request succeeds without error
        }
    };

    render() {
        return (
            <div>
                <input type="file" onChange={this.handleNewImage} />
                <input
                    name="scale"
                    type="range"
                    onChange={this.handleScale}
                    min={this.state.allowZoomOut ? "0.1" : "1"}
                    max="2"
                    step="0.01"
                    defaultValue="1"
                />
                {this.state.image && (
                    <AvatarEditor
                        ref={this.setEditorRef}
                        image={this.state.image}
                        width={this.state.width}
                        height={this.state.height}
                        border={50}
                        borderRadius={this.state.borderRadius}
                        color={[255, 255, 255, 0.6]} // RGBA
                        scale={this.state.scale}
                        rotate={this.state.rotate}
                        position={this.state.position}
                        onPositionChange={this.handlePositionChange}
                    />
                )}
                <div className="buttons-container">
                    <button onClick={this.handleSubmit}>SUBMIT</button>
                </div>
                {this.state.preview && (
                    <div>
                        <h3>Preview:</h3>
                        <img src={this.state.preview} alt="Preview" />
                    </div>
                )}
            </div>
        );
    }
}

function UserSettings() {
    return (
        <div className="uSettingsContainer">
            <h1>User Settings</h1>
            <UploadImage />
        </div>
    );
}

export default UserSettings;