import React from 'react';
import AvatarEditor from 'react-avatar-editor';

class UploadImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
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
            const reader = new FileReader();
            reader.onload = (event) => {
                this.setState({ image: event.target.result });
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
            // Your submit logic here
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