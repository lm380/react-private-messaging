import { useEffect, useState } from 'react';
import { MessagePanel } from './MessagePanel';
import { User } from './User';
import socket from '../socket';
import './Chat.css';

export const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.self) {
            return { ...user, connected: true };
          }
          return user;
        });
      });
    };

    const handleDisconnect = () => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.self) {
            return { ...user, connected: false };
          }
          return user;
        });
      });
    };

    const initReactiveProperties = (user) => {
      return {
        ...user,
        connected: true,
        messages: [],
        hasNewMessages: false,
      };
    };

    const handleUsers = (socketUsers) => {
      const updatedUsers = socketUsers.map((user) => {
        const updatedUser = {
          ...user,
          self: user.userID === socket.id,
        };
        return initReactiveProperties(updatedUser);
      });
      setUsers(updatedUsers);
    };

    const handleUserConnected = (user) => {
      const updatedUser = initReactiveProperties(user);
      setUsers((prevUsers) => [...prevUsers, updatedUser]);
    };

    const handleUserDisconnected = (id) => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.userID === id) {
            return { ...user, connected: false };
          }
          return user;
        });
      });
    };

    const handlePrivateMessage = ({ content, from }) => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.userID === from) {
            const updatedMessages = [
              ...user.messages,
              { content, fromSelf: false },
            ];
            const hasNewMessages = user !== selectedUser;
            const enrichedUser = {
              ...user,
              messages: updatedMessages,
              hasNewMessages,
            };
            if (user.userID === selectedUser?.userID) {
              setSelectedUser(enrichedUser);
            }
            return enrichedUser;
          }
          if (user.userID === selectedUser?.userID) {
            setSelectedUser(user);
          }
          return user;
        });
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('users', handleUsers);
    socket.on('user connected', handleUserConnected);
    socket.on('user disconnected', handleUserDisconnected);
    socket.on('private message', handlePrivateMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('users', handleUsers);
      socket.off('user connected', handleUserConnected);
      socket.off('user disconnected', handleUserDisconnected);
      socket.off('private message', handlePrivateMessage);
    };
  }, [selectedUser]);

  const onSelectUser = (user) => {
    setSelectedUser(user);
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.userID === user.userID) {
          return { ...u, hasNewMessages: false };
        }
        return u;
      })
    );
  };

  const onMessage = (content) => {
    if (selectedUser) {
      socket.emit('private message', {
        content,
        to: selectedUser.userID,
      });
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.userID === selectedUser.userID) {
            const updatedMessages = [
              ...u.messages,
              { content, fromSelf: true },
            ];
            const enrichedUser = { ...u, messages: updatedMessages };
            setSelectedUser(enrichedUser);
            return enrichedUser;
          }
          return u;
        })
      );
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="left-panel">
        {users.map((user) => {
          return (
            <User
              key={user.userID}
              user={user}
              selected={selectedUser?.userID === user.userID}
              setIsSelected={() => onSelectUser(user)}
            />
          );
        })}
      </div>
      {selectedUser && (
        <MessagePanel user={selectedUser} submitHandler={onMessage} />
      )}
    </div>
  );
};
