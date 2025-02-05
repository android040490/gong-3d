import EventEmitter from "eventemitter3";
import { ResourcesEvent } from "./Resources";
import { SizesEvent } from "./Sizes";
import { TimeEvent } from "./Time";

type EventType = ResourcesEvent | SizesEvent | TimeEvent;

export class EventsManager extends EventEmitter<EventType> {
  constructor() {
    super();
  }
}

export default new EventsManager();
