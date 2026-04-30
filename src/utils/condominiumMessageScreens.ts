import {
  CondominiumMessageScreenType,
  CondominiumMessageType,
} from "../types/condominium-message.type";

type MessageLike = Pick<CondominiumMessageType, "screen_id" | "starttime" | "endtime">;

export const getMessageScreens = (
  message?: MessageLike | null
): CondominiumMessageScreenType[] => message?.screen_id || [];

export const getMessageScreenIds = (message?: MessageLike | null): string[] =>
  getMessageScreens(message).map((screen) => screen.screen_id);

export const getMessageScreenById = (
  message: MessageLike | undefined | null,
  screenId: string
): CondominiumMessageScreenType | undefined =>
  getMessageScreens(message).find((screen) => screen.screen_id === screenId);

export const syncSelectedMessageScreens = (
  selectedIds: string[],
  currentScreens: CondominiumMessageScreenType[],
  defaultStarttime?: Date,
  defaultEndtime?: Date
): CondominiumMessageScreenType[] =>
  selectedIds.map((screenId) => {
    const current = currentScreens.find((screen) => screen.screen_id === screenId);

    return (
      current || {
        screen_id: screenId,
        starttime: defaultStarttime,
        endtime: defaultEndtime,
      }
    );
  });

export const removeMessageScreen = (
  screens: CondominiumMessageScreenType[],
  screenId: string
): CondominiumMessageScreenType[] => screens.filter((screen) => screen.screen_id !== screenId);

export const upsertMessageScreen = (
  screens: CondominiumMessageScreenType[],
  nextScreen: CondominiumMessageScreenType
): CondominiumMessageScreenType[] => {
  const hasScreen = screens.some((screen) => screen.screen_id === nextScreen.screen_id);

  if (!hasScreen) {
    return [...screens, nextScreen];
  }

  return screens.map((screen) =>
    screen.screen_id === nextScreen.screen_id ? nextScreen : screen
  );
};
