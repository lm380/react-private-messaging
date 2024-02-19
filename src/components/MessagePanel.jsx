import { useEffect, useState } from 'react';
import { StatusIcon } from './StatusIcon';
import './MessagePanel.css';

export const MessagePanel = ({ user, submitHandler }) => {
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(user.connected);

  useEffect(() => {
    setIsConnected(user.connected);
  }, [user]);
  const updateInput = (event) => {
    setInput(event.target.value);
  };
  const onSubmit = (event) => {
    event.preventDefault();
    submitHandler(input);
    setInput('');
  };

  const displaySender = (message, index) => {
    return (
      index === 0 ||
      user.messages[index - 1].fromSelf !== user.messages[index].fromSelf
    );
  };

  const isValid = () => {
    return input.length > 0;
  };

  return (
    <>
      <div className="message-panel-wrapper">
        <div className="header">
          <StatusIcon connected={isConnected} />
          {user.username}
        </div>

        <ul className="messages">
          {user.messages?.map((message, index) => {
            return (
              <li className="message" key={index}>
                {displaySender(message, index) && (
                  <div className="sender">
                    {message.fromSelf ? '(yourself)' : user.username}
                  </div>
                )}
                {message.content}
              </li>
            );
          })}
        </ul>

        <form onSubmit={onSubmit} className="form">
          <textarea
            onChange={updateInput}
            value={input}
            placeholder="Your message..."
            className="input"
          />
          <button disabled={!isValid} className="send-button">
            Send
          </button>
        </form>
      </div>
    </>
  );
};
