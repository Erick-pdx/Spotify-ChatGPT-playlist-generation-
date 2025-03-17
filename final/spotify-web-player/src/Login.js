import React from 'react';
import spotifyLogo from './spotify_logo.png';
import openAILogo from './ChatGPT_logo.png';
import plus from './plus_symbol.png';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
            <h2>Generate AI-Powered Playlists with Spotify & ChatGPT</h2>
                <p>Login with your Spotify account to create custom playlists based on your favorite songs or moods!</p>
                <a className="btn-spotify" href="/auth/login" >
                    Login with Spotify 
                </a>
                <section>
                    <img
                        alt="The Spotify Logo"
                        className="logo-image"
                        src={spotifyLogo} 
                    />
                    <img
                        alt="An addtion symbol logo"
                        className="plus-image"
                        src={plus} 
                    />

                    <img
                        alt="The OpenAi logo"
                        className="logo-image"
                        src={openAILogo} 
                    />
                </section>
            </header>
        </div>
    );
}

export default Login;

