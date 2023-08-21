import { ConsoleCss } from "./constants";
import { HeadMessage } from "./types";

export const callConsoleMessage = (
  headMessage: HeadMessage,
  message: string,
  cssHeadMessage?: HeadMessage
) => {
  if (headMessage === "Init:") {
    return console.log(
      `%c${message}`,
      `${ConsoleCss[cssHeadMessage ?? headMessage]}`
    );
  }
  return console.log(
    `%c${headMessage}`,
    `${ConsoleCss[cssHeadMessage ?? headMessage]}`,
    message
  );
};
