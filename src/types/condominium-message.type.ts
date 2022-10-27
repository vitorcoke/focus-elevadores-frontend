export type CondominiumMessage = {
    _id: string;
    user_id?: string;
    name: string;
    title?: string;
    message?: string;
    dayweek?: string;
    starttime?: Date;
    endtime?: Date;
    jpg_file?: string;
    type: string;
}