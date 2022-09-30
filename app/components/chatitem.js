import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import { htmlSafe } from '@ember/template';

export default class ChatitemComponent extends Component {
  @service badges;

  get computedStyle() {
    return htmlSafe(`left: calc(350px * ${this.args.index});`);
  }

  get borderStyle() {
    return htmlSafe(`border: 4px solid ${this.args.colour || 'white'}`);
  }

  get colourStyle() {
    return htmlSafe(`color: ${this.args.colour || 'white'}`);
  }

  get badgeImages() {
    return this.badges.getImages(this.args.context);
  }

  // borrowed with ❤️ from https://www.stefanjudis.com/blog/how-to-display-twitch-emotes-in-tmi-js-chat-messages/
  get messageHtml() {
    let emotes = this.args.context?.emotes;
    let message = this.args.message;

    if (!emotes) {
      return message;
    }

    const stringReplacements = [];

    // iterate of emotes to access ids and positions
    Object.entries(emotes).forEach(([id, positions]) => {
      // use only the first position to find out the emote key word
      const position = positions[0];
      const [start, end] = position.split('-');
      const stringToReplace = message.substring(
        parseInt(start, 10),
        parseInt(end, 10) + 1
      );

      stringReplacements.push({
        stringToReplace: stringToReplace,
        replacement: `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0">`,
      });
    });

    // generate HTML and replace all emote keywords with image elements
    const messageHTML = stringReplacements.reduce(
      (acc, { stringToReplace, replacement }) => {
        // obs browser doesn't seam to know about replaceAll
        return acc.split(stringToReplace).join(replacement);
      },
      message
    );

    return messageHTML;
  }

  get isEmojiOnly() {
    let tmp = document.createElement('div');
    tmp.innerHTML = this.messageHtml;

    return tmp.textContent.trim().length === 0;
  }
}
