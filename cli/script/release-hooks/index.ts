import {ReleaseHook} from "../../definitions/cli";

var hooks: ReleaseHook[] = [
  require('./signing'),
  require('./core-release'),
];

export default hooks;
