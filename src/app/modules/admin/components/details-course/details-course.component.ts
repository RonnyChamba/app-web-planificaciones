import { Component, Input, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CourseFullModel, DetailsCourseModel } from '../../models/course.model';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { CourseTeacherService } from '../../services/course-teacher.service';

import { firstValueFrom } from 'rxjs';
import { WeekModel } from '../../models/week.model';
import { PlanificationService } from '../../services/planification.service';
import { PlanificationModel } from '../../models/planification.model';

@Component({
  selector: 'app-details-course',
  templateUrl: './details-course.component.html',
  styleUrls: ['./details-course.component.scss']
})
export class DetailsCourseComponent implements OnInit {


  @Input() uidCourse: string = "";

  courseFullModel: CourseFullModel;
  constructor(private courseService: CourseService,
    private detailCourseService: CourseTeacherService,
    private planificationService: PlanificationService,
    private teacherService: RegisterService) { }

  ngOnInit(): void {

    console.log(`Id Customer get : ${this.uidCourse}`);

    this.loadDataPage();
  }

  async loadDataPage() {

    // get course
    await this.loadCourse();


    //  get details course
    await this.loadDetailsCourse();

    // get teachers
    await this.loadTeachers();

    // get tutor, no es necesario  esperar  porque se puede obtener del teacher que se obtiene en el paso anterior
    this.loadTutor();

    // Get Weeks by course
    await this.loadWeeks();


    // get Planification by  fisrt week | si no hay semana disponible  no se muestra el boton de planificacion
    await this.loadPlanification();



    console.log(this.courseFullModel);

  }


  async loadCourse() {

    // get course
    const respCourse = await firstValueFrom(this.courseService.findCourseById(this.uidCourse));
    this.courseFullModel = respCourse.data() as CourseFullModel;
    this.courseFullModel.uid = respCourse.id;
    console.log("cursos cargado");

  }

  async loadDetailsCourse() {

    //  get detauls course
    const respDetailsCourse = await firstValueFrom(this.detailCourseService.findTeacherByCourseId(this.courseFullModel.uid || ""));

    // console.log(respDetailsCourse.docs);
    const detailsCourse: DetailsCourseModel[] = [];
    respDetailsCourse.docs.forEach((item: any) => {

      const details = item.data();
      details.uid = item.id;
      detailsCourse.push(details);


    });

    this.courseFullModel.detailsCourse = detailsCourse;

    console.log("details course cargado");
  }

  async loadTeachers() {

    console.log("loadTeachers", this.courseFullModel);

    // get teachers
    const teachers: ModelTeacher[] = [];

    if (this.courseFullModel.detailsCourse.length > 0) {
      const resp = await firstValueFrom(this.teacherService.findTeacherByInIde(this.courseFullModel.detailsCourse.map((item) => item.teacher)));

      resp.docs.forEach((item: any) => {

        const teacher = item.data() as ModelTeacher;
        teacher.uid = item.id;
        teachers.push(teacher);

      });
    }else console.log("No hay teachers");

    this.courseFullModel.teachers = teachers;
    //  console.log(teachers);

    console.log("teachers cargado");
  }

  async loadTutor() {

    const existTutorInTeachers = this.courseFullModel.teachers.find((item) => item.uid === this.courseFullModel.tutor);

    if (existTutorInTeachers) {
      this.courseFullModel.tutorTeacher = existTutorInTeachers;
    }
    else {

      const respTutor = await firstValueFrom(this.teacherService.findTeacherById(this.courseFullModel.tutor));
      this.courseFullModel.tutorTeacher = respTutor.data() as ModelTeacher;
      this.courseFullModel.tutorTeacher.uid = respTutor.id;

    }

  }

  async loadWeeks() {


    const respWeeks = await firstValueFrom(this.detailCourseService.findWeeksByCourseId(this.courseFullModel.uid as string));

    // console.log(respWeeks.docs);


    const weeks: WeekModel[] = [];
    respWeeks.docs.forEach((item: any) => {

      const week = item.data();
      week.uid = item.id;

      // this.courseFullModel.weeks.push(week);
      weeks.push(week);

    });

    this.courseFullModel.weeks = weeks;
  }

  async loadPlanification() {


    // get Planification by  fisrt week | si no hay semana disponible no se puede planificar
    if (this.courseFullModel.weeks.length > 0) {

      // Obtener planificacion de la primera semana , es la que se carga por defecto
      const uidFirstWeek = this.courseFullModel.weeks[0].uid || "";


      // console.log("uidFirstWeek", uidFirstWeek);

      const respPlanification = await firstValueFrom(this.planificationService.findPlanificationByWeeksId(uidFirstWeek));

      // console.log(respPlanification.docs);

      // arreglo de planificacion
      const planification: PlanificationModel[] = [];

      respPlanification.docs.forEach((item: any) => {
        // console.log(item.data());

        const plan = item.data() as PlanificationModel;
        plan.uid = item.id;

        // agregar cada planificacion al arreglo
        planification.push(plan);

      });

      // Asignar planificacion a la primera semana
      this.courseFullModel.weeks[0].planifications = planification;

    } else console.log("No hay semanas disponibles para planificar");

  }



  /**
   * async loadDateCourse() {



    const respCourse = await firstValueFrom(this.courseService.findCourseById(this.uidCourse));

    this.courseFullModel = respCourse.data() as CourseFullModel;
    this.courseFullModel.uid = respCourse.id;

    //  get detauls course
    const respDetailsCourse = await firstValueFrom(this.detailCourseService.findTeacherByCourseId(this.courseFullModel.uid || ""));

    // console.log(respDetailsCourse.docs);

    this.courseFullModel.detailsCourse = [];

    respDetailsCourse.docs.forEach((item: any) => {
      
      const detailsCourse = item.data();
      detailsCourse.uid = item.id;

      this.courseFullModel.detailsCourse.push(detailsCourse);

      // console.log(detailsCourse);

    });

  
    // get teachers
    const teachers: ModelTeacher[] = [];
    const resp = await firstValueFrom(this.teacherService.findTeacherByInIde(this.courseFullModel.detailsCourse.map((item) => item.teacher)));


    console.log(resp);

    resp.docs.forEach((item: any) => {

      const teacher = item.data() as ModelTeacher;
      teacher.uid = item.id;

      console.log(teacher);
      
      teachers.push(teacher);

    });

    this.courseFullModel.teachers = teachers;

    console.log(teachers);
    
    // get tutor
    const existTutorInTeachers = this.courseFullModel.teachers.find((item) => item.uid === this.courseFullModel.tutor);

    if (existTutorInTeachers) {

      this.courseFullModel.tutorTeacher = existTutorInTeachers;
    }
    else {
    
      const respTutor = await firstValueFrom(this.teacherService.findTeacherById(this.courseFullModel.tutor));
      this.courseFullModel.tutorTeacher = respTutor.data() as ModelTeacher;
      this.courseFullModel.tutorTeacher.uid = respTutor.id;

    }



    // Get Weeks by course
    const respWeeks = await firstValueFrom(this.detailCourseService.findWeeksByCourseId(this.courseFullModel.uid));

    // console.log(respWeeks.docs);


    const weeks: WeekModel[] = [];
    respWeeks.docs.forEach((item: any) => {

      const week = item.data();
      week.uid = item.id;

      // this.courseFullModel.weeks.push(week);
      weeks.push(week);
      
    });

    this.courseFullModel.weeks = weeks;


    // get Planification by  fisrt week | si no hay semana disponible no se puede planificar
    if (this.courseFullModel.weeks.length > 0) {
      // console.log("Hay semanas disponibles para planificar");


    // Obtener planificacion de la primera semana

    const uidFirstWeek = this.courseFullModel.weeks[0].uid || "";

    console.log("uidFirstWeek", uidFirstWeek);
    
    const respPlanification = await firstValueFrom(this.planificationService.findPlanificationByWeeksId(uidFirstWeek ));

    console.log(respPlanification.docs);

    // arreglo de planificacion
    const planification: PlanificationModel[] = [];

    respPlanification.docs.forEach((item: any) => {
      // console.log(item.data());
        
        const plan = item.data() as PlanificationModel;
        plan.uid = item.id;
  
        // agregar cada planificacion al arreglo
        planification.push(plan);
  
      });

      // Asignar planificacion a la primera semana
      this.courseFullModel.weeks[0].planifications = planification;

    }else console.log("No hay semanas disponibles para planificar");

    console.log(this.courseFullModel);

  }
   */

}
