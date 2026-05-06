import {
  CondominiumMessageScreenType,
  CondominiumMessageType,
} from "../types/condominium-message.type";

type MessageLike = Pick<CondominiumMessageType, "screen_id" | "starttime" | "endtime">;

const normalizeDate = (value?: Date) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const hydrateMessageScreen = (
  screen: CondominiumMessageScreenType,
  message?: MessageLike | null
): CondominiumMessageScreenType => ({
  ...screen,
  starttime: normalizeDate(screen.starttime) ?? normalizeDate(message?.starttime),
  endtime: normalizeDate(screen.endtime) ?? normalizeDate(message?.endtime),
});

export const getMessageScreens = (
  message?: MessageLike | null
): CondominiumMessageScreenType[] =>
  (message?.screen_id || []).map((screen) => hydrateMessageScreen(screen, message));

export const getMessageScreenIds = (message?: MessageLike | null): string[] =>
  getMessageScreens(message).map((screen) => screen.screen_id);

export const getMessageScreenById = (
  message: MessageLike | undefined | null,
  screenId: string
): CondominiumMessageScreenType | undefined =>
  getMessageScreens(message).find((screen) => screen.screen_id === screenId);

export const syncSelectedMessageScreens = (
  selectedIds: string[],
  currentScreens: CondominiumMessageScreenType[]
): CondominiumMessageScreenType[] =>
  selectedIds.map((screenId) => {
    const current = currentScreens.find((screen) => screen.screen_id === screenId);

    return (
      current || {
        screen_id: screenId,
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

export const hasIncompleteMessageScreens = (
  screens: CondominiumMessageScreenType[]
): boolean =>
  screens.some((screen) => !normalizeDate(screen.starttime) || !normalizeDate(screen.endtime));

export const getMessageDateRange = (message?: MessageLike | null) => {
  const screens = getMessageScreens(message);
  const dates = screens.flatMap((screen) => {
    const starttime = normalizeDate(screen.starttime);
    const endtime = normalizeDate(screen.endtime);
    return [starttime, endtime].filter(Boolean) as Date[];
  });

  if (!dates.length) {
    return {
      starttime: normalizeDate(message?.starttime),
      endtime: normalizeDate(message?.endtime),
    };
  }

  return {
    starttime: new Date(Math.min(...dates.map((date) => date.getTime()))),
    endtime: new Date(Math.max(...dates.map((date) => date.getTime()))),
  };
};
