/* eslint-disable no-unused-vars */
class MessageStore {
  findMessagesForUser(userID) {}
  saveMessage(message) {}
}
class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUser(userID) {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID
    );
  }
}

// eslint-disable-next-line no-undef
module.exports = {
  InMemoryMessageStore,
};
