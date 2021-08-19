import Route from '@ember/routing/route';

export default class TimerRoute extends Route {
  model(params) {
    return parseInt(params.seconds);
  }
}
