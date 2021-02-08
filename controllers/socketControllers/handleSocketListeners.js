// socket listeners listen to their partners' statuses updates, online or offline
const socketsListeners = {};

module.exports.addListener = function (listener, partner) {
  const partnersArray = socketsListeners[listener];

  if (partnersArray) {
    if (partnersArray.indexOf(partner) === -1) {
      socketsListeners[listener] = [...partnersArray, partner];
    }
  } else {
    socketsListeners[listener] = [partner];
  }
};

module.exports.deleteListener = function (listener, partner) {
  const partnersArray = socketsListeners[listener]; // Array of listener's partners

  // filter the partner out of the array
  const updatedPartnersArray = partnersArray.filter(partnerUsername => partnerUsername !== partner);

  // add the updated partnersArray to the object
  socketsListeners[listener] = [...updatedPartnersArray];
};

module.exports.notifyListener = function (io, user, status) {
  // emit to room, not to specific sockets
  io.to(room).emit("user status update", {
    user,
    status: false
  })
};