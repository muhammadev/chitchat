module.exports = function deleteSocketListener(listener, informer, socketsListeners) {
  const informersArray = socketsListeners[listener]; // Array of listener's informers

  // filter the informer out of the array
  const updatedInformersArray = informersArray.filter(informerUsername => informerUsername !== informer);

  // add the updated informersArray to the object
  socketsListeners[listener] = [...updatedInformersArray];

  return socketsListeners;
}