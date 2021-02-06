module.exports = function setSocketListener(listener, informer, socketsListeners) {
  /*
    --- socketsListeners object schema ---
    socketListeners = {
      socketListener1: [informer2, informer3]
    }

    - socketListener1's real value is the listener username
    - informer2, and informer3's real values are the informers usernames
    - a socket listener is a user subscribed to get certain updates from an informer
    - updates such as informer is online, informer is offline, informer is writing, etc
    - a socketListener's username is a key which its value is an array consists of a list of informers' usernames
    - setSocketListener method's job is to check whether the informer user is a new user or not
    - if not, do nothing
    - if a new user, inject to the socketListener's array
    - the method takes three arguments, the listener's username, the informer's username, and the socketsListeners object
    - it returns the updated socketsListeners object
  */

  const informersArray = socketsListeners[listener]; // Array of listener's informers

  if (informersArray /*existed*/) {
    // check if the informer is not subscribed yet
    if (informersArray.indexOf(informer) === -1) {
      informersArray.push(informer);

      // add the updated informersArray to the object
      socketsListeners[listener] = [...informersArray];
    }
  } else {
    // if this is the first informer for that listener, create the informers' array
    socketsListeners[listener] = [informer];
  }

  return socketsListeners;
}