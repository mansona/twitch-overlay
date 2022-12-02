import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class TimerComponent extends Component {
  @tracked text;
  @tracked secondsLeft;
  @tracked snoozed;

  @service socket;

  get playSound() {
    return this.args.playSound && this.timerDone && !this.snoozed;
  }

  get timerDone() {
    return this.secondsLeft < 0;
  }

  get percentDone() {
    return this.secondsLeft / this.args.seconds;
  }

  get dashoffset() {
    return Math.min(283 - Math.floor(283 * this.percentDone), 283);
  }

  constructor() {
    super(...arguments);

    this.socket.on('snooze timer', () => {
      this.snoozed = true;

      setTimeout(() => {
        this.snoozed = false;
      }, 60 * 1000);
    });

    if (this.args.persistanceId) {
      let time = parseInt(localStorage.getItem(this.args.persistanceId));

      if (!time) {
        localStorage.setItem(this.args.persistanceId, Date.now());
        time = Date.now();
      }

      this.startingTime = performance.now() - (Date.now() - time);
    }

    if (!this.startingTime) {
      this.startingTime = performance.now();
    }

    let minutes = Math.floor(this.args.seconds / 60);
    let seconds = Math.floor(this.args.seconds % 60);

    this.text = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  @action
  animate() {
    requestAnimationFrame(this.rafCallback);
  }

  @action
  rafCallback(timestamp) {
    let secondsElapsed = Math.floor((timestamp - this.startingTime) / 1000);
    this.secondsLeft = this.args.seconds - secondsElapsed;

    if (this.timerDone) {
      this.text = 'GO!';
      if (this.args.persistanceId) {
        localStorage.removeItem(this.args.persistanceId);
      }
      return;
    }

    let minutes = Math.floor(this.secondsLeft / 60);
    let seconds = Math.floor(this.secondsLeft % 60);

    let text = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (this.text != text) {
      this.text = text;
    }

    requestAnimationFrame(this.rafCallback);
  }
}
