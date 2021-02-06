module.exports = function setSocketListener(listener, partner, socketsListeners) {
  /*
    --- socketsListeners object schema ---
    socketListeners = {
      socketListener1: [partner2, partner3]
    }

    - socketListener1's real value is the listener username
    - partner2, and partner3's real values are the partners usernames
    - a socket listener is a user subscribed to get certain updates from an partner
    - updates such as partner is online, partner is offline, partner is writing, etc
    - a socketListener's username is a key which its value is an array consists of a list of partners' usernames
    - setSocketListener method's job is to check whether the partner user is a new user or not
    - if not, do nothing
    - if a new user, inject to the socketListener's array
    - the method takes three arguments, the listener's username, the partner's username, and the socketsListeners object
    - it returns the updated socketsListeners object
  */

  const partnersArray = socketsListeners[listener]; // Array of listener's partners

  if (partnersArray /*existed*/) {
    // check if the partner is not subscribed yet
    if (partnersArray.indexOf(partner) === -1) {
      partnersArray.push(partner);

      // add the updated partnersArray to the object
      socketsListeners[listener] = [...partnersArray];
    }
  } else {
    // if this is the first partner for that listener, create the partners' array
    socketsListeners[listener] = [partner];
  }

  return socketsListeners;
}