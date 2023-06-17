import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import { storeData, loadData } from '../utils/local-storage';

export default class ChatboxComponent extends Component {
  @service socket;

  @tracked
  messages = [];

  constructor() {
    super(...arguments);

    this.messages = loadData('messages');

    this.socket.on('clear chat', () => {
      this.messages = [];

      storeData('messages', this.messages);
    });

    this.socket.on('chat message', (msg) => {
      this.messages = [
        {
          message: msg.msg,
          from: msg.context['display-name'],
          colour: msg.context.color,
          context: msg.context,
        },
        // this essentially only keeps a max of 5 of the old messages
        ...this.messages.slice(0, 10),
      ];

      storeData('messages', this.messages);
    });
  }
}
