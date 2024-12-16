import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AvatarEditor from 'react-avatar-editor';
import { useNavigate, useRouteLoaderData } from 'react-router-dom'; //To navigate to other pages in the app
import { jwtDecode } from 'jwt-decode'; //To decode userId from token

const accessToken = "sl.CCto1bEmOW5z_t1jDoNjkLQdx3Tv72YrVud-CdfdLkDpnOwGSqywC1gCpSHbmthGiyJz6V_8XFrxDJaCdTG7Rb4mdsC7b-tLYMEXC5PkBo_IiEo_Se5-U6At2EKm0FKNohc4cYJa_lYb";

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
            height: 300
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
            this.props.setPfpLink(this.state.fileName); // Add this line inside handleSubmit
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
    const [pfpLink, setPfpLink] = useState();
    const [token, setToken] = useState();
    const [userId, setUserId] = useState();
    const [user, setUser] = useState({ username: "" });
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const handlePfpLinkUpdate = (fileName) => {
        setPfpLink(fileName);
    };

    const handleUserNameChange = (e) => {
        setUsername(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

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

    async function savePfpLink(userId, link)
    {
        try
        {
            console.log('Updating user', userId, link);
            const res = await axios.put(`http://localhost:3000/users/${userId}`, { pfpLink: link },
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

    useEffect(() => {
        if (pfpLink) {
            savePfpLink(userId, pfpLink);
        }
    }, [pfpLink]);

    async function updateUser(userId, changes)
    {
        try
        {
            console.log('Updating user', userId, changes);
            const res = await axios.put(`http://localhost:3000/users/${userId}`, changes,
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
        <div className="uSettingsContainer">
            <h1>User Settings</h1>
            <div className='NameAndPassword'>
                <h2>Change Username</h2>
                <input onChange={handleUserNameChange} placeholder="Enter new username" />
                <h2>Change Password</h2>
                <input onChange={handlePasswordChange} type="text" placeholder="Enter new password" />
                <button onClick={() => updateUser(userId, { username, password })}>Submit</button>
            </div>
            <div>
            <UploadImage setPfpLink={handlePfpLinkUpdate} />
            </div>
        </div>
    );
}

export default UserSettings;