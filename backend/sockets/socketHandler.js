/**
 * Production Socket.IO Real-time Handler Engine for Backend
 */
export function initializeSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO Server: ${socket.id}`);

    // Join driver or passenger private room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Driver GPS Location Stream Handler
    socket.on('driver:location_update', (data) => {
      // Broadcast location tick to passenger room or admin monitor
      socket.broadcast.emit('driver:location_update', data);
    });

    // Driver Acceptance Handler
    socket.on('driver:accept_ride', (data) => {
      io.to(data.rideId).emit('ride:status_change', {
        status: 'DRIVER_ASSIGNED',
        driver: data.driver
      });
      socket.broadcast.emit('driver:accept_ride', data);
    });

    // Shared Passenger Join Request Handler
    socket.on('ride:shared_passenger_join_request', (data) => {
      io.emit('ride:shared_passenger_join_request', data);
    });

    // Shared Passenger Joined Broadcast
    socket.on('ride:shared_passenger_joined', (data) => {
      io.emit('ride:shared_passenger_joined', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
