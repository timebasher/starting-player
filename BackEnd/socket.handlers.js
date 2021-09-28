const {
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
} = require("./utils/utils");
const { User } = require("./utils/models/user");

async function handleJoin(namespaceInstance, socket, data) {
  const { username } = data;
  // console.log(`Socket ${socket.id} joining namespace ${namespace.name}`);
  const user = new User(socket.id, username);
  socket.data = user;

  const activeUsers = await namespaceInstance.getActiveUsers();
  console.log("join", activeUsers);
  namespaceInstance.connection.emit("emitActiveUsers", activeUsers);
}

async function handleDisconnect(namespaceInstance) {
  // console.log(`Disconnected: ${socket.id}`);
  const activeUsers = await namespaceInstance.getActiveUsers();
  console.log("disconnect", activeUsers);
  namespaceInstance.connection.emit("emitActiveUsers", activeUsers);
}

function handleUserMouseUp(namespaceInstance, socket) {
  // cancel function when user Presses Up again
  namespaceInstance.connection.emit("emitAllUserPressingMouseDown", false);
  namespaceInstance.stopTimer();

  if (Object.keys(socket.data).length === 0) return;
  socket.data.setPressingMouseDown(false);

  namespaceInstance.connection.emit("emituserMouseUp", socket.id);
}

async function handleUserPressedMouse(namespaceInstance, socket) {
  if (Object.keys(socket.data).length === 0) return;

  socket.data.setPressingMouseDown(true); 
  namespaceInstance.connection.emit("emituserPressedMouse", socket.data);
  const activeUsers = await namespaceInstance.getActiveUsers();

  if (determineIfAllUserArePressingMouseDown(activeUsers)) {
    // Start Time and Emit Winners array if timer runs to 0
    namespaceInstance.startTimer().then(() => {
      const winnerArray = determineWinner(activeUsers);
      namespaceInstance.connection.emit("emitWinnerArray", winnerArray);
    });
    namespaceInstance.connection.emit("emitAllUserPressingMouseDown", true);
  }
}

function setCurrentPosition(namespaceInstance, socket, data) {
  const { cords } = data;
  if (Object.keys(socket.data).length === 0) return;

  socket.data.setCords(cords.x, cords.y);
  namespaceInstance.connection.emit("emitCursorPositionsData", socket.data);
}

async function handleRestartGameStart(namespaceInstance, socket) {
  if (Object.keys(socket.data).length === 0) return;
  socket.data.setIsInterceptiongRestartCircle(true);

  const activeUsers = await namespaceInstance.getActiveUsers();
  namespaceInstance.connection.emit("emituserInterceptRestartCircleStart", activeUsers);

  if (determineIfAllUserAreInterceptingRestartCircle(activeUsers)) {
    namespaceInstance.connection.emit("emitAllUserInterceptRestartCircle");
  }
}

async function handleRestartGameEnd(namespaceInstance, socket) {
  if (Object.keys(socket.data).length === 0) return;
  socket.data.setIsInterceptiongRestartCircle(false);

  const activeUsers = await namespaceInstance.getActiveUsers();
  namespaceInstance.connection.emit("emituserInterceptRestartCircleCancel", activeUsers);
}

module.exports = {
  handleJoin,
  handleDisconnect,
  handleUserMouseUp,
  handleUserPressedMouse,
  setCurrentPosition,
  handleRestartGameStart,
  handleRestartGameEnd,
};