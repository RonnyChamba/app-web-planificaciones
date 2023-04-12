export interface PlanificationModel {
    uid?: string;
    week: string;
    dateCreated: string;
    status: boolean;
    deleted: boolean;
    title: string;
    details: string;
    resource:string[];

}