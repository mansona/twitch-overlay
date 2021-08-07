import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import fetch from 'fetch';

export default class ApplicationRoute extends Route {
  @service badges;
  async model() {
    // this doesn't actually connect the socket, this is a hack to allow socket.io
    // to reuse the same server as ember-cli. For some reason it's only available
    // on a request 🤷
    await fetch('/connect/socket');

    let badges = await fetch('/badges');
    let badgesJson = await badges.json();

    this.badges.setData(badgesJson);
  }
}
