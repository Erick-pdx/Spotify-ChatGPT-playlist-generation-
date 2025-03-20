import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback'
import Login from './Login'
import './App.css';

function App() {
  //managing the token state
  const [token, setToken] = useState('');
  useEffect(() => {
    //getting the acess token from the server backend
    async function getToken() {
      
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

  //rendering the login or webplayback 
  return (
    <>
        { (token === '') ? <Login/> : <WebPlayback token={token} /> }
    </>
  );
}

export default App;