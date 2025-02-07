import { Root } from "./Root";
import { SplashScreen } from "./SplashScreen";
import { ProgressBar } from "./ProgressBar";
import { Blocker } from "./Blocker";

const components = [Root, SplashScreen, ProgressBar, Blocker];

components.forEach((component) => {
  customElements.define(component.selector, component);
});
