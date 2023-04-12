import { ModelBaseTeacher, ModelTeacher } from "../../teacher/models/teacher";
import { WeekModel } from "./week.model";

export interface CourseModel {
    uid?: string;
    name: string;
    parallel: string;
    tutor: string;
}


export interface DetailsCourseModel {
    uid?: string;
    curso: string;
    teacher: string;
}

export interface CourseFullModel extends CourseModel {
    tutorTeacher: ModelTeacher;
    weeks: WeekModel[];

    detailsCourse: DetailsCourseModel[];
    teachers: ModelTeacher[];

 
}
