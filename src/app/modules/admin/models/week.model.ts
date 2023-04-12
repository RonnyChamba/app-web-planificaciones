import { PlanificationModel } from "./planification.model";

export interface  WeekModel {
    uid?: string;   
    title: string;
    details: string;
    course: string;
    numberWeek: number;
    planifications: PlanificationModel[];

}