import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

function getKey() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.toString();
}

function storeMessages(messages) {
  localStorage.setItem(getKey(), JSON.stringify(messages));
}

function loadMessages() {
  return JSON.parse(localStorage.getItem(getKey()) ?? '[]');
}

export default class ChatboxComponent extends Component {
  @service socket;

  @tracked
  messages = [];

  constructor() {
    super(...arguments);

    this.messages = loadMessages();

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

      storeMessages(this.messages);
    });
  }
}
