import { PlanificationModel } from "./planification.model";


export interface  WeekModelBase {

    uid?: string;   
    title: string;
    details: string;
    course: string;
    numberWeek: number;
    timestamp?: number

}

export interface  WeekModel extends WeekModelBase {

    planifications: PlanificationModel[];

}
