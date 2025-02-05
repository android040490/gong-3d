import { Root } from "./Root";
import { SplashScreen } from "./SplashScreen";
import { ProgressBar } from "./ProgressBar";

const components = [Root, SplashScreen, ProgressBar];

components.forEach((component) => {
  customElements.define(component.selector, component);
});
