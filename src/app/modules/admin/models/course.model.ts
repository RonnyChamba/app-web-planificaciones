import {  ModelTeacher } from "../../teacher/models/teacher";
import { WeekModel } from "./week.model";

export interface CourseModel {
    uid?: string;
    name: string;
    parallel: string;
    // sera un objeto  con los datos del profesor, fullName y su uid
    tutor?: any;
    periodo?: string;
}


export interface DetailsCourseModel {
    uid?: string;
    curso: string;
    teacher: string;
}

export interface CourseFullModel extends CourseModel {
    // tutorTeacher: ModelTeacher;
    weeks: WeekModel[];

    detailsCourse: DetailsCourseModel[];
    teachers: ModelTeacher[];

 
}
