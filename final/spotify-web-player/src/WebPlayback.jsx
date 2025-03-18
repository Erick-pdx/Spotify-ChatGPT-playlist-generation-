import React, { useState, useEffect } from 'react';
import stepOne from './StepOne.png';
import StepTwo from './StepTwo.png';


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

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);

    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");


    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

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

            player.connect();

        };
    }, []);

  const handleChatSubmit = async () => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY; 
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      console.error("OpenAI API key is missing. Check your .env file.");
      return;
    }

    const requestBody = {
      model: "gpt-4",
      messages: [{ role: "user", content: chatInput }],
    };

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
      setChatResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
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
