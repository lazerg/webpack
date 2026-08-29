import { double } from "./library";

// esm answers `undefined` here per spec, whatever the option says
export const topLevelThis = typeof this;
export const doubled = double([2]);
