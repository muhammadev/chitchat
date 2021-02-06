module.exports.statusUpdate = function(io, socketsListeners, online_users, user, status) {
  // notify socket listeners
  if (socketsListeners) {
    Object.keys(socketsListeners).forEach((listener) => {
      if (socketsListeners[listener].indexOf(user) !== -1) {
        io.to(online_users[listener]).emit("user status update", {
          user,
          isOnline: status,
        });
      }
    });
  }
}