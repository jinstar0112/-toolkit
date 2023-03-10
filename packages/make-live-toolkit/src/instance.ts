import { EventListener, isValidEvent, Subscription } from "./events";
import { Strategy } from "./strategy";
import { createIFrameStrategy } from "./iframe-strategy";
import { Command } from "./commands";

export type Instance = {
  addEventListener: (listener: EventListener) => Subscription;
  sendCommand: (command: Command) => void;
  url: URL;
};

export type CreateInstanceArgs = {
  container: HTMLDivElement;
  strategy?: Strategy;
  url: string | URL;
};

export const createInstance = ({
  container,
  strategy = createIFrameStrategy(),
  url,
}: CreateInstanceArgs): Instance => {
  if (container == null || !(container instanceof HTMLDivElement)) {
    throw new Error("Missing 'container'. Must be a `HTMLDivElement`.");
  }
  if (url == null) {
    throw new Error("Missing 'url'");
  }

  let eventListeners: Array<EventListener> = [];

  strategy.prepare(container, url, (event) => {
    if (isValidEvent(event)) {
      eventListeners.forEach((l) => l(event));
    }
  });

  return {
    addEventListener: (listener) => {
      eventListeners.push(listener);

      return () => {
        eventListeners = eventListeners.filter((l) => l !== listener);
      };
    },
    sendCommand: (command) => {
      strategy.sendCommand(command);
    },
    url: new URL(url),
  };
};
