import Service from '@ember/service';
import { io } from 'socket.io-client';

export default class SocketService extends Service {
  socket = io();

  on(message, callback) {
    this.socket.on(message, callback);
  }

  emit() {
    this.socket.emit(...arguments);
  }
}
