import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ButtonComponent extends Component {
  @service socket;

  @action
  emit() {
    this.socket.emit('client message', this.args.message);
  }
}
