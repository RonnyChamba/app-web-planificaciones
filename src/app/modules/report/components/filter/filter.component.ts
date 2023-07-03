import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, of, tap } from 'rxjs';
import { CourseModel } from 'src/app/modules/admin/models/course.model';
import { CourseService } from 'src/app/modules/admin/services/course.service';
import { PeriodosService } from 'src/app/modules/admin/services/periodos.service';
import { ReportService } from 'src/app/modules/admin/services/report.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  private subscription = new Subscription();

  periodoCurrent: any;
  periodos: any[] = [];
  courses: CourseModel[] = [];
  teachers: ModelTeacher[] = [];

  private subscriptionList: Subscription;

  private subsLoadTeacher: Subscription = new Subscription();

  constructor(
    private periodosService: PeriodosService,
    private messageService: MensajesServiceService,
    private courseService: CourseService,
    private toaster: ToastrService,
    private teacherService: RegisterService,
    private reportService: ReportService
  ) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionList.unsubscribe();
    this.subsLoadTeacher.unsubscribe();
  }
  ngOnInit(): void {

    this.createForm();
    this.messageService.loading(true);
    this.subscription = this.periodosService.findAllPeriodosActivos().subscribe((data: any) => {


      this.periodos = data.map((e: any) => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        };
      }
      );

      console.log(this.periodos);
      if (this.periodos.length > 0) {

        this.periodoCurrent = this.periodos[0];

        this.formGroup.controls['periodo'].setValue(this.periodoCurrent.id, { emitEvent: false });

        this.loadProperties();
      }
    }, (error: any) => {
      console.log(error);
      this.messageService.loading(false);
    }

    );
    this.onChangeEvent();

  }

  private onChangeEvent() {



    this.formGroup.controls['periodo'].valueChanges.subscribe((value: any) => {
      this.periodoCurrent = this.periodos.find((item: any) => item.id == value);

      this.loadProperties();
    }
    );

    this.formGroup.controls['curso'].valueChanges.subscribe((value: any) => {
      this.loadTeachers();
    }
    );
  }
  createForm() {
    this.formGroup = new FormGroup({
      periodo: new FormControl("",
        [
          Validators.required,
        ], []),

      docente: new FormControl('',
        [

        ]),

      curso: new FormControl(false, [Validators.required]),

      estado: new FormControl([],
        [Validators.required]),
    });
  }

  private loadProperties() {

    this.subscriptionList = this.courseService.findAllCoursesByPeriodo(this.periodoCurrent.id)
      .pipe(
        tap(async (resp: any) => {



          // const userCurrent = await this.register.findTeacherById(uidUser).toPromise();

          // const coursesByTeacher = userCurrent.data().courses;

          // console.log("userCurrent", coursesByTeacher);
          this.courses = [];
          resp.forEach((item: any) => {

            const course: CourseModel = item.payload.doc.data() as CourseModel;
            course.uid = item.payload.doc.id;
            course.tutor = course.tutor.fullName || "NO ASIGNADO";

            // // Si es admin, se muestran todos los cursos
            // if (rol == 'ADMIN') {
            //   this.courses.push(course);
            //   return;
            // }

            // Si es tutor, se muestran solo los cursos que tiene asignado
            // if (coursesByTeacher.includes(course.uid)) {
            this.courses.push(course);
            // }

            // console.log("course ---");
          });

          if (this.courses.length > 0) {
            this.formGroup.controls['curso'].setValue(this.courses[0].uid, { emitEvent: false });
          }

          this.messageService.loading(false);

          this.loadTeachers();
        }),
        catchError((err) => {
          console.log(err);
          this.messageService.loading(false);
          this.toaster.error("Error al cargar los cursos", "Error");
          return of(null);
        }
        )
      ).subscribe();
  }

  loadTeachers() {

    // console.log("loadTeachers", this.courseFullModel);

    // get teachers


    this.subsLoadTeacher = this.teacherService.findAllTeachersOnChanges()

      .pipe(
        tap((resp: any) => {

          // this.courseFullModel.teachers = [];

          // const teachers: ModelTeacher[] = [];

          this.teachers = [];
          resp.forEach((element: any) => {

            const teacher: ModelTeacher = element.payload.doc.data() as ModelTeacher;
            teacher.uid = element.payload.doc.id;

            const curso = this.formGroup.controls['curso'].value;

            if (teacher.courses?.includes(curso || "")) {
              this.teachers.push(teacher);

            }

          });

          // console.log(teachers);

        }),
        catchError((err: any) => {
          console.log("err", err);
          this.messageService.loading(false);
          this.toaster.error("Error al cargar los profesores", "Error");
          return of(null);
        })
      ).subscribe();
    // console.log("teachers cargado");
  }


onClickedFilter() {

  const courseId = this.formGroup.controls['curso'].value;

  this.reportService.findWeeksByCourseId(courseId).pipe(
    tap((resp: any) => {
      console.log(resp);

      // procesa la respuesta
      const weeks = resp.docs.map((item: any) => {
        return {
          id: item.id,
          ...item.data()
        };
      }
      );

      console.log(weeks);

    }
    ),
    catchError((err: any) => {
      console.log(err);
      return of(null);
    }
    )
  ).subscribe();


}

}
