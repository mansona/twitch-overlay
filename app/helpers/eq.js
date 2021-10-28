import { helper } from '@ember/component/helper';

export default helper(function eq(positional /*, named*/) {
  return positional[0] === positional[1];
});
