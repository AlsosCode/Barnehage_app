import { children } from "./children";

export function getRandomChild() {
  return children[Math.floor(Math.random() * children.length)];
}
