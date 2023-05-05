import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CourseFullModel, CourseModel, DetailsCourseModel } from '../../models/course.model';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { CourseTeacherService } from '../../services/course-teacher.service';

import { Subscription, catchError, firstValueFrom, map, of, tap, throwError } from 'rxjs';
import { WeekModel, WeekModelBase } from '../../models/week.model';
import { PlanificationService } from '../../services/planification.service';
import { PlanificationModel } from '../../models/planification.model';
import { WeekService } from '../../services/week.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WeekComponent } from '../week/week.component';
import { UtilDetailsService } from '../../services/util-details.service';
import { FormPlanificationComponent } from '../form-planification/form-planification.component';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { ToastrService } from 'ngx-toastr';
import { ReviewService } from '../../services/review.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
  selector: 'app-details-course',
  templateUrl: './details-course.component.html',
  styleUrls: ['./details-course.component.scss']
})
export class DetailsCourseComponent implements OnInit, OnDestroy {


  // here add suscriptiones
  private subscription: Subscription = new Subscription();

  // represent the current week, this is used to show the planification of the current week
  indexWeekCurrent: number = 0;

  @Input() uidCourse: string = "";

  courseFullModel: CourseFullModel;

  planification: any;

  isAdmin: boolean = false;

  constructor(
    private courseService: CourseService,
    private detailCourseService: CourseTeacherService,
    private planificationService: PlanificationService,
    private uploadFileService: UploadFileService,
    private reviewService: ReviewService,
    private modal: NgbModal,
    private router: Router,
    private weekService: WeekService,
    private teacherService: RegisterService,
    private toaster: ToastrService,
    private tokenService: TokenService,
    private utilDetailsService: UtilDetailsService,) {

    this.isAdmin = this.tokenService.isLoggedAdmin();
  }

  ngOnInit(): void {

    console.log(`Id Customer get : ${this.uidCourse}`);
    this.loadDataPage();
    this.refreshWeeks();
    this.refreshPlanifications();


  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Cada vez que se crea una nueva semana, se debe refrescar la lista de semanas,
   * en el formulario de crear semana se emite un evento para refrescar la lista de semanas
   * y aqui se suscribe a ese evento
   */
  refreshWeeks() {

    // suscribirse al evento de refrescar semanas cuando se crea una nueva semana del curso
    this.subscription.add(this.utilDetailsService.refreshWeeksAsObservable().subscribe(async () => {


      let planificacion: any = [];

      // verificar si antes de que fuera creado el trimerste, ya existan trimestres , osea que no sea la primera semana que fuera creanda
      if (this.courseFullModel.weeks.length > 0) {

        // Ante de recargar las semanas se guarda la planificacion de la actual semana
        planificacion = this.courseFullModel.weeks[this.indexWeekCurrent].planifications;

      }  // En caso de quel trimestre sea el primero que se creo, no es conveniente recargar la planificacion de la semana actual ya que no existe



      // recargar semanas
      await this.loadWeeks();

      // recargar planificacion de la semana actual, esto se hace para que no se pierda la planificacion de la semana actual
      this.courseFullModel.weeks[this.indexWeekCurrent].planifications = planificacion;



    }));

  }

  /**
   * Cada vez que se crea una nueva planificacion, se debe refrescar la lista de planificaciones,
   * en el formulario de crear planificacion se emite un evento para refrescar la lista de planificaciones
   * y aqui se suscribe a ese evento
   */
  refreshPlanifications() {

    this.subscription.add(this.utilDetailsService.refreshDataPlanification.asObservable().subscribe(async () => {

      // recargar planificacion de la semana actual
      await this.loadPlanification();

    }));

  }


  async loadDataPage() {

    // get course
    await this.loadCourse();


    //  get details course
    await this.loadDetailsCourse();

    // get teachers
    await this.loadTeachers();

    // get tutor, no es necesario  esperar  porque se puede obtener del teacher que se obtiene en el paso anterior
    // this.loadTutor();

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
    } else console.log("No hay teachers");

    this.courseFullModel.teachers = teachers;
    //  console.log(teachers);

    console.log("teachers cargado");
  }


  async loadWeeks() {


    const respWeeks = await firstValueFrom(this.weekService.findWeeksByCourseId(this.courseFullModel.uid as string));

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

      // Obtener  uid  del trimestre actual
      const uidFirstWeek = this.courseFullModel.weeks[this.indexWeekCurrent].uid || "";


      // console.log("uidFirstWeek", uidFirstWeek);

      const respPlanification = await firstValueFrom(this.planificationService.findPlanificationByWeeksId(uidFirstWeek));

      // console.log(respPlanification.docs);

      // console.log("planificacion cargada", respPlanification);

      // arreglo de planificacion
      const planification: PlanificationModel[] = [];

      respPlanification.docs.forEach((item: any) => {
        // console.log(item.data());

        const plan = item.data() as PlanificationModel;

        // asignar uid de la planificacion
        plan.uid = item.id;

        // agregar cada planificacion al arreglo
        planification.push(plan);

      });

      // Asignar planificacion al trimestre actual
      this.courseFullModel.weeks[this.indexWeekCurrent].planifications = planification;

    } else console.log("No hay trimestre disponibles para planificar");

  }


  openModalWeeks(value: any) {

    console.log("openModalWeeks");
    // this.modal.open(WeekComponent, { size: 'xl', centered: true, scrollable: true, backdrop: 'static', keyboard: false, windowClass: 'modal-weeks' })
    const ref = this.modal.open(WeekComponent, { size: 'md' })

    // paso un objeto al modal  un objeto de tipo CourseFullModel pero solo con los atributos que necesito del objeto
    ref.componentInstance.courseModel = this.courseFullModel as CourseModel
  }

  openModalPlanification() {

    if (this.verifyIfExistWeeks) {
      // alert("semanas disponibles para planificar");

      // Obtengo  el trimestre actual, cada planificacion se guarda por trimestre
      const weekCurrent = this.courseFullModel.weeks[this.indexWeekCurrent];

      // console.log("uidWeekCurrent", weekCurrent);

      const ref = this.modal.open(FormPlanificationComponent, { size: 'md' })

      // paso un objeto al modal  un objeto de tipo CourseFullModel pero solo con los atributos que necesito del objeto weekCurrent
      // no necesito los atributos de planification por eso no los paso
      // ref.componentInstance.weekModel = weekCurrent as WeekModelBase;

      ref.componentInstance.dataInput = {
        action: "NEW",
        data: weekCurrent as WeekModelBase
      };
    } else alert("No hay trimestres disponibles para planificar");




  }

  async changeNumberWeek(numberWeek: number) {

    console.log("changeNumberWeeks", numberWeek);

    if (this.indexWeekCurrent !== numberWeek) {
      this.indexWeekCurrent = numberWeek;

      // console.log("changeNumberWeeks", numberWeek);

      await this.loadPlanification();
      // this.courseFullModel.numberWeeks = numberWeek;

    } else console.log("no se cambio el numero de semana");
  }


  get planificationExistByCurrentWeek() {

    return (this.verifyIfExistWeeks && (this.courseFullModel.weeks[this.indexWeekCurrent] &&
      this.courseFullModel.weeks[this.indexWeekCurrent].planifications
      && this.courseFullModel.weeks[this.indexWeekCurrent].planifications.length > 0));
  }


  get verifyIfExistWeeks() {

    return (this.courseFullModel && this.courseFullModel.weeks && this.courseFullModel.weeks.length > 0);

  }

  viewDetailsPlanification(index: number) {


    // obtener planificacion seleccionada
    const planification = this.courseFullModel.weeks[this.indexWeekCurrent].planifications[index];

    this.utilDetailsService.refreshDataDetailPlanification.next({
      action: "details",
      planification: planification
    });
  }

  uploadFilePlanification(index: number) {



    const planification = this.courseFullModel.weeks[this.indexWeekCurrent].planifications[index];
    console.log("planification", planification);

    this.utilDetailsService.refreshDataDetailPlanification.next({
      action: "upload",
      planification: planification
    });
  }

  reviewPlanification(uid: any) {

    this.router.navigate(['/planification', uid]);

    const course = {
      uid: this.courseFullModel.uid,
      name: `${this.courseFullModel.name} ${this.courseFullModel.parallel}`
    }

    this.tokenService.setCourse(course);
  }



  teacherAlreadyUploadPlanification(uidPlani: any): boolean {

    // Obtengo un arreglo con los uid de los profesores que ya subieron planificacion, para saber si el profesor actual logeado ya subio planificacion
    // y asi no permitirle subir otra planificacion y mostrarle otros botones

    const extractData = this.extractUidDetailsPlanification(uidPlani);
    const details_Upload = extractData.details_Upload;
    const uidTeacher = extractData.teacher_uid;

    // console.log("planificatio subidia", details_Upload);

    return details_Upload?.find((item: any) => item.teacher_uid === uidTeacher) ? true : false;

  }

  /**
   * Eliminar o descargar planificacion del profesor actual logeado
   */
  deleteOrDownloadPlanification(uidPlani: any, action: string) {

    const uidDetailsPlanification = this.getUidDetailsPlanification(uidPlani);

    if (uidDetailsPlanification) {

      // console.log("uidDetailsPlanification", uidDetailsPlanification);

      if (action === "DELETE") {
        this.deleteDetailsPlanification(uidDetailsPlanification, uidPlani);
      } else if (action === "DOWNLOAD") {

        this.reviewService.findDetailsPlaniByUid(uidDetailsPlanification)
          .pipe(

            tap(async (resp: any) => {
              const data = resp.data();

              await this.dowloadFile(data?.resource);

            }),
            catchError((err: any) => {
              console.log("err", err);
              this.toaster.error("No se encontro el detalle de la planificacion para descargar");
              return of(null);
            })
          ).subscribe();

      }

    } else this.toaster.warning("No se encontro el detalle de la planificacion");

  }


  private getUidDetailsPlanification(uidPlani: any): string | null {

    const extractData = this.extractUidDetailsPlanification(uidPlani);

    const details_Upload = extractData.details_Upload;
    const uidTeacher = extractData.teacher_uid;

    const detailsRow = details_Upload?.find((item: any) => item.teacher_uid === uidTeacher);

    return detailsRow ? detailsRow.details_uid : null;

  }

  private extractUidDetailsPlanification(uidPlani: any): any {

    // Obtengo los details de la planificacion actual o sleccionada
    const details_Upload = this.courseFullModel.weeks[this.indexWeekCurrent].
      planifications.find((item: any) => item.uid === uidPlani)?.details_planification;

    // obtengo el uid del profesor actual logeado para saber si ya subio planificacion y asi no permitirle subir otra
    const userCurrent = JSON.parse(this.tokenService.getToken() || "{}");
    const teacher_uid = userCurrent.uid;

    return {
      details_Upload, // aqui viene una lista de los detalles de la planificacion
      teacher_uid // el uid del profesor actual logeado
    };
  }


  deleteDetailsPlanification(uidDetails: any, uidPlani: any) {

    console.log("uidDetails", uidDetails);

    // Obtengo la planificacion actual o sleccionada de la cual se va a eliminar el detalle de la planificacion
    const planification = this.courseFullModel.weeks[this.indexWeekCurrent].planifications.find((item: any) => item.uid === uidPlani);

    console.log("planification before", planification);

    this.reviewService.deleteDetailsPlanification(uidDetails)
      .then(async () => {

        // Filtro los detalles de la planificacion actual o sleccionada y elimino el detalle de la planificacion que fue eliminado
        planification!.details_planification = planification!.details_planification!.filter((item: any) => item.details_uid !== uidDetails);
        console.log("planification after ", planification);


        // actualizo los detalles de la planificacion
        await this.planificationService.updateDetailsPlaniByPlanification(uidPlani, planification?.details_planification)


        this.toaster.info("Detalle de la planificacion eliminado correctamente");


      })
      .catch((err: any) => {
        console.log("err", err);
        this.toaster.error("Error al eliminar el detalle de la planificacion");
      });




  }

  async dowloadFile(resource: any) {

    // console.log(resource);

    try {

      const resp = await this.uploadFileService.dowloadFile(resource);
      console.log("Archivo descargado correctamente");

    } catch (error) {

      this.toaster.error('Error al descargar el archivo');
    }


  }

  edit(plani: any){

    if (this.verifyIfExistWeeks) {
    

      const ref = this.modal.open(FormPlanificationComponent, { size: 'md' })

      ref.componentInstance.dataInput = {
        action: "EDIT",
        data: plani
      };

    } else alert("No hay trimestres disponibles para planificar");


  }
}
