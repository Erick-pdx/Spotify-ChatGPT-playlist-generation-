import React, { useState, useEffect } from 'react';
import stepOne from './StepOne.png';
import StepTwo from './StepTwo.png';

//The data that is used for the webplayer
const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

//the main webplay back that use the spotify login/player
function WebPlayback(props) {

    //states used in the spotify api
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);

    //states used in the chat gpt api
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            //made a device to user to connect spotify instance to web app
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(player);
            
            //print the device ID when connected to running app
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            //incase of error or disconnect
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {
                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            //connect the player to active istance
            player.connect();

        };
    }, []);

    //main chat handler for connecting and POST
    const handleChatSubmit = async () => {
        const apiKey = process.env.REACT_APP_OPENAI_API_KEY; 
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        if (!chatInput.trim()) return; // Prevent empty requests

        //make sure that api key is being used
        if (!apiKey) {
            console.error("OpenAI API key is missing. Check your .env file.");
        return;
        }

        // Ensure ChatGPT always understands it's creating a Spotify playlist
        //and this it should try to avoid adding any sentences after
        const prompt = `Create a Spotify playlist for the following request: "${chatInput}".
        - Include at least 10 song recommendations.
        - Format the response like this: 
        1. "Song Title" by Artist Name
        2. "Song Title" by Artist Name
        - Only return the list, without extra explanations.
        -Dont say anything beside song names as this will be used for the making of the playlist
        -Again unless its the name and artist of the song dont put anything else
        -Don't say anything to end the response just the songs needs to be in the response
        -If making a playlist about one artist put by the artist after every song
        -Have to put by and than the artist`;   

        //the model it will use
        const requestBody = {
            model: "gpt-4",
            messages: [{ role: "user", content: chatInput }],
        };

        //this is the query from the user sent through the api to gpt
        try {
            const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });
     
        const data = await res.json();
        if (!data.choices || data.choices.length === 0) {
            throw new Error("Invalid response from ChatGPT.");
        }

        const playlistResponse = data.choices[0].message.content;
        setChatResponse(playlistResponse);

        // Call the function to create the playlist
        createSpotifyPlaylist(playlistResponse);

        } catch (error) {
            console.error("Error fetching ChatGPT response:", error);
            setChatResponse("Failed to generate a playlist. Please try again.");
        }
    };
    
    //creating the playlist from the response in chat
    const createSpotifyPlaylist = async (chatResponse) => {
        const token = props.token;
        if (!token) {
          console.error("Spotify token is missing.");
          return;
        }
      
        // Use regex to extract songs from the chatResponse string.
        // This regex will capture the number, song title (inside quotes), and the rest as artist info.
        //(\d+) catches the digites and puts them in group 1 (ex: 1. 2. 3.)
        //(\s*"([^"]+)) Catches anything in quotes which should be song titles in group 2 
        //\s+by\s+(.+)/ catches everything after by meaning the arist in group 3
        const songRegex = /(\d+)\.\s*"([^"]+)"\s*(?:-\s*|by\s+)(.+)/g;
        const songMatches = [...chatResponse.matchAll(songRegex)];
      
        if (songMatches.length === 0) {
          console.error("No valid songs found in response:", chatResponse);
          return;
        }
      
        // Convert regex matches into an array of song objects.
        // from the regex groups put each into an array 
        const songList = songMatches.map(match => ({
          title: match[2].trim(),
          artist: match[3].trim()
        }));
        console.log("Extracted Songs:", songList);
      
        try {
            //get the user data from its user token
            const userResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = await userResponse.json();
          if (!userData.id) {
            console.error("Failed to get user ID:", userData);
            return;
          }
          const userId = userData.id;
          console.log("User ID:", userId);
      
          //POST for making the playlist.
          const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                //name the playlist the responce plus GPT playlist
              name: `GPT Playlist: ${chatInput}`, 
              public: false,
            }),
          });
          const playlistData = await playlistResponse.json();
          if (!playlistData.id) {
            console.error("Failed to create playlist. API response:", playlistData);
            return;
          }
          const playlistId = playlistData.id;
          console.log("Playlist created successfully:", playlistId);
      
          //search for each song on Spotify and get their track URIs
          let trackUris = [];
          for (let song of songList) {
            const searchQuery = `${song.title} ${song.artist}`;
            const searchResponse = await fetch(
              `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const searchData = await searchResponse.json();
            if (searchData.tracks && searchData.tracks.items.length > 0) {
              trackUris.push(searchData.tracks.items[0].uri);
            }
          }
          console.log("Extracted track URIs:", trackUris);
      
          if (trackUris.length === 0) {
            console.error("No valid tracks found on Spotify.");
            return;
          }
      
          //add songs to playlist
          const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: trackUris }),
          });
      
          if (!addTracksResponse.ok) {
            console.error("Failed to add songs:", await addTracksResponse.json());
            return;
          }
      
          console.log("Songs added to playlist successfully!");
      
        } catch (error) {
          console.error("Error creating Spotify playlist:", error);
        }
      };
            


  if (!is_active) {
    return (
      <div className="container">
        <div className="main-wrapper">
          <b> Instance not active. Transfer your playback using your Spotify app </b>
        </div>
        <div className="instructions-container">
          <img alt="Step One of connecting player to application, clicking Connect to Device " src={stepOne} className="instructions" />
          <img alt="The Spotify Logo" src={StepTwo} className="instructions2" />
        </div>
      </div>
    );
  } else {
    return (
        
      <div className="container">
        <div className="main-wrapper">
                    {/*This is whats on the website page For the Spotify player and section*/}
          <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />
          <div className="now-playing__side">
            <div className="now-playing__name">{current_track.name}</div>
            <div className="now-playing__artist">{current_track.artists[0].name}</div>
            <button className="btn-spotify" onClick={() => player.previousTrack()}>
              &lt;&lt;
            </button>
            <button className="btn-spotify" onClick={() => player.togglePlay()}>
              {is_paused ? "PLAY" : "PAUSE"}
            </button>
            <button className="btn-spotify" onClick={() => player.nextTrack()}>
              &gt;&gt;
            </button>
          </div>
        </div>

        {/*This is whats on the website page for the gpt section*/}
        <h2 className='GPT-title'>Create a Playlist with GPT</h2>        
        <div className="input-container">
          <input
            className='input_GPT'
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Tell GPT what you want in the playlist"
          />
          <button className='send-button_GPT' onClick={handleChatSubmit}>Send</button>
          </div>

        <div className="response-container">
            <p className='gptResponse'>Response: {chatResponse}</p>
        </div>
      </div>
    );
  }
}

export default WebPlayback;
