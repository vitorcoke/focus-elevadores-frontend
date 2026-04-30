export type CondominiumMessageScreenType = {
  screen_id: string;
  starttime?: Date;
  endtime?: Date;
};

export type CondominiumMessageType = {
  _id: string;
  user_id?: string;
  name: string;
  title?: string;
  message?: string;
  dayweek?: string;
  starttime?: Date;
  endtime?: Date;
  jpg_file?: string;
  screen_id?: CondominiumMessageScreenType[];
  time_exibition?: number;
};
