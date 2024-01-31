import './StatusIcon.css';

export const StatusIcon = ({ connected }) => {
  return <i className={`icon ${connected ? 'connected' : ''}`}></i>;
};
