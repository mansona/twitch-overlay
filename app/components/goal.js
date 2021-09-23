import Component from '@glimmer/component';

export default class GoalComponent extends Component {
  get completedPercent() {
    return (this.args.current / this.args.target) * 100;
  }

  get completedClass() {
    if (this.completedPercent >= 100) {
      return 'completed';
    }
  }
}
