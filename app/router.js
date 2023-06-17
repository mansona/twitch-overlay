import EmberRouter from '@ember/routing/router';
import config from 'new-stream-overlay/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('timer', { path: 'timer/:seconds' });
  this.route('dashboard');
  this.route('chat');
  this.route('notifications');
});
