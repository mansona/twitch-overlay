import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import io from 'socket.io/client-dist/socket.io.js';

export default class ChatboxComponent extends Component {
  socket = io();

  @tracked
  messages = [];

  constructor() {
    super(...arguments);

    this.socket.on('chat message', (msg) => {
      this.messages = [
        {
          message: msg.msg,
          from: msg.context['display-name'],
          colour: msg.context.color,
          context: msg.context,
        },
        // this essentially only keeps a max of 5 of the old messages
        ...this.messages.slice(0, 5),
      ];
    });
  }
}
