module.exports = function deleteSocketListener(listener, partner, socketsListeners) {
  const partnersArray = socketsListeners[listener]; // Array of listener's partners

  // filter the partner out of the array
  const updatedPartnersArray = partnersArray.filter(partnerUsername => partnerUsername !== partner);

  // add the updated partnersArray to the object
  socketsListeners[listener] = [...updatedPartnersArray];

  return socketsListeners;
}