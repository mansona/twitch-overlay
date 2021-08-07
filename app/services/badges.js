import Service from '@ember/service';

export default class BadgesService extends Service {
  badgeInfo = {};

  getImages(context) {
    return Object.keys(context?.badges ?? []).map((key) => {
      let value = context.badges[key];

      return this.badgeInfo[key][value];
    });
  }

  setData(data) {
    data.data.forEach((item) => {
      let versions = {};

      item.versions.forEach((version) => {
        versions[version.id] = version.image_url_1x;
      });

      this.badgeInfo[item.set_id] = versions;
    });
  }
}
