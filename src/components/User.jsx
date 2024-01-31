import { StatusIcon } from './StatusIcon';
import './User.css';

export const User = ({ user, selected, setIsSelected }) => {
  const status = user.connected ? 'online' : 'offline';
  const onClick = () => {
    setIsSelected(!selected);
  };
  return (
    <div className={`user ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="description">
        <div className="name">
          {user.username} {user.self ? ' (yourself)' : ''}
        </div>
        <div className="status">
          <StatusIcon connected={user.connected} />
          {status}
        </div>
      </div>
      {user.hasNewMessages && <div className="new-messages">!</div>}
    </div>
  );
};
