import { useState } from 'react';
import './SelectUsername.css';

export const SelectUsername = ({ submitHandler }) => {
  const [userName, setUserName] = useState('');
  const updateUserName = (event) => {
    setUserName(event.target.value);
  };
  const isValid = () => {
    return userName.length > 2;
  }; //might need to come back to this logic

  const onSubmit = (event) => {
    event.preventDefault();
    submitHandler(userName);
  };
  return (
    <div className="select-username">
      <form onSubmit={onSubmit}>
        <input onChange={updateUserName} placeholder="Your username..." />
        <br />
        <button disabled={!isValid}>Send</button>
      </form>
    </div>
  );
};
