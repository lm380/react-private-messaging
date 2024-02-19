import { useEffect, useState } from 'react';
import { Chat } from './components/Chat';
import { SelectUsername } from './components/SelectUsername';
import socket from './socket';
import './App.css';

export default function App() {
  const [userNameAlreadySelected, setUserNameAlreadySelected] = useState(false);
  useEffect(() => {
    const sessionID = localStorage.getItem('sessionID');

    if (sessionID) {
      setUserNameAlreadySelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }

    socket.on('session', ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      localStorage.setItem('sessionID', sessionID);
      socket.userID = userID;
    });

    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        setUserNameAlreadySelected(false);
      }
    });
    return () => {
      socket.off('connect_error');
    };
  }, []);
  const onUsernameSelection = (username) => {
    setUserNameAlreadySelected(true);
    socket.auth = { username };
    socket.connect();
  };
  return (
    <div id="app">
      {!userNameAlreadySelected ? (
        <SelectUsername submitHandler={onUsernameSelection} />
      ) : (
        <Chat />
      )}
    </div>
  );
}
