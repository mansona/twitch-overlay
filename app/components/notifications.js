import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

const DATA_TYPE = 'notifications';

import { storeData, loadData } from '../utils/local-storage';

export default class NotificationsComponent extends Component {
  @service socket;

  @tracked notifications = [];

  constructor() {
    super(...arguments);

    this.notifications = loadData(DATA_TYPE);

    this.socket.on('notification', (notification) => {
      this.notifications = [notification, ...this.notifications];

      storeData(DATA_TYPE, this.notifications);
    });

    this.socket.on('clear notifications', () => {
      this.notifications = [];

      storeData(DATA_TYPE, this.notifications);
    });
  }
}
