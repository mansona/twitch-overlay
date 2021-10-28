import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const LOCAL_STORAGE_KEY = 'task-list-index';

export default class TaskListComponent extends Component {
  @service socket;

  @tracked
  activeIndex = 0;

  constructor() {
    super(...arguments);

    let storedIndex = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY));

    if (storedIndex && storedIndex < this.args.tasks.length) {
      this.activeIndex = storedIndex;
    }

    this.socket.on('advance index', () => {
      this.activeIndex = Math.min(
        this.activeIndex + 1,
        this.args.tasks.length - 1
      );

      localStorage.setItem(LOCAL_STORAGE_KEY, this.activeIndex);
    });

    this.socket.on('retreat index', () => {
      this.activeIndex = Math.max(this.activeIndex - 1, 0);

      localStorage.setItem(LOCAL_STORAGE_KEY, this.activeIndex);
    });
  }
}
