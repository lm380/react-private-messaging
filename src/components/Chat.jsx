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
        hasNewMessages: false,
      };
    };

    const handleUsers = (socketUsers) => {
      const updatedUsers = socketUsers.map((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userID;
        });
        if (checkExistingUser([...users], user, user.connected, true)) return;
        const updatedUser = {
          ...user,
          self: user.userID === socket.userID,
        };
        return initReactiveProperties(updatedUser);
      });
      const sortedUsers = updatedUsers.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      setUsers(sortedUsers);
    };

    const checkExistingUser = (usersArr, user, isConnected, isMessages) => {
      let isExistingUser = usersArr.some(
        (oldUser) => user.userID === oldUser.userID
      );

      if (isExistingUser)
        setUsers((prevUsers) => {
          return prevUsers?.map((existingUser) => {
            const updatedUser = { ...existingUser };
            if (user.userID === updatedUser.userID) {
              updatedUser.connected = isConnected;
              if (isMessages) updatedUser.messages = user.messages;
              if (user.userID === selectedUser?.userID) {
                setSelectedUser(updatedUser);
              }
            }
            return updatedUser;
          });
        });
      return isExistingUser;
    };

    const handleUserConnected = (user) => {
      if (checkExistingUser([...users], user, true)) return;
      const updatedUser = initReactiveProperties(user);
      setUsers((prevUsers) => [...prevUsers, updatedUser]);
    };

    const handleUserDisconnected = (id) => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          let checkedUser = { ...user };
          if (user.userID === id) {
            checkedUser.connected = false;
            //If the selected user is disconnected we need to update the bound variable
            if (user.userID === selectedUser?.userID) {
              setSelectedUser(checkedUser);
            }
          }
          return checkedUser;
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
            //need to update the selected user if they're affected
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
  }, [selectedUser, users]);

  const onSelectUser = (user) => {
    setSelectedUser(user);
    setUsers((prevUsers) =>
      prevUsers.map((users) => {
        if (users.userID === user.userID) {
          return { ...users, hasNewMessages: false };
        }
        return users;
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
        prevUsers.map((users) => {
          if (users.userID === selectedUser.userID) {
            const updatedMessages = [
              ...users.messages,
              { content, fromSelf: true },
            ];
            const enrichedUser = { ...users, messages: updatedMessages };
            setSelectedUser(enrichedUser);
            return enrichedUser;
          }
          return users;
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
