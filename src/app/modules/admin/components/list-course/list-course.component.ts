import { Component, OnDestroy, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CourseModel } from '../../models/course.model';
import { Router } from '@angular/router';
import { Subscription, catchError, of, pipe, tap } from 'rxjs';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { UtilDetailsService } from '../../services/util-details.service';

@Component({
  selector: 'app-list-course',
  templateUrl: './list-course.component.html',
  styleUrls: ['./list-course.component.scss']
})
export class ListCourseComponent implements OnInit, OnDestroy {


  courses: CourseModel[] = [];

  private subscriptionList: Subscription;

  constructor(
    private courseService: CourseService,

    private auth: LoginService,
    private toaster: ToastrService,
    private register: RegisterService,
    private token: TokenService,
    private roter: Router,
    private utilService: UtilDetailsService,
    private messageService: MensajesServiceService) { }

  ngOnInit(): void {

    this.utilService.refreshDataCurrentPeriodo.subscribe((idePeriodo: string) => {
      console.log("resp periodo ...", idePeriodo);
      this.loadCourses(idePeriodo);
    });

  }

  ngOnDestroy(): void {

    if (this.subscriptionList) {
      this.subscriptionList.unsubscribe();
    }

  }

  loadCourses(idPeriodo: string) {

    this.messageService.loading(true, "Cargando cursos");

    const uidUser = JSON.parse(this.token.getToken() || '{}').uid;
    const rol = JSON.parse(this.token.getToken() || '{}').rol;

    this.subscriptionList = this.courseService.findAllCoursesByPeriodo(idPeriodo)
      .pipe(
        tap( async  (resp: any) => {



          const userCurrent = await this.register.findTeacherById(uidUser).toPromise();

          const coursesByTeacher = userCurrent.data().courses;

          // console.log("userCurrent", coursesByTeacher);
          this.courses = [];
          resp.forEach((item: any) => {

            const course: CourseModel = item.payload.doc.data() as CourseModel;
            course.uid = item.payload.doc.id;
            course.tutor = course.tutor.fullName || "NO ASIGNADO";
            
            // Si es admin, se muestran todos los cursos
            if (rol == 'ADMIN') {
              this.courses.push(course);
              return;
            }

            // Si es tutor, se muestran solo los cursos que tiene asignado
            if (coursesByTeacher.includes(course.uid)) {
              this.courses.push(course);
            }

            // console.log("course ---");
          });

          this.messageService.loading(false);
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

  viewCourse(uid: string) {
    // console.log(uid);
    this.roter.navigate(['/course', uid]);
  }

  async getTeacherCurrent(): Promise<any> {


    try {


      const userCurrent = await this.auth.getUserCurrent();

      // console.log("userCurrent", userCurrent);
      return userCurrent?.uid;

    } catch (error) {

      console.log("error", error);
      return null;
    }

    return;

    return new Promise((resolve, reject) => {
      this.auth.getUserCurrent()

        .then((user) => {

          console.log("user", user);
          this.register.findTeacherById(user!.uid)


            .subscribe((resp: any) => {
              console.log("teacherResp", resp);

              // const resp 

              resolve(resp);
            },

              (err) => {
                console.log(err);
                reject(err);
              }
            );
        })
        .catch((err) => {
          // console.log(err);
          reject(err);
        });
    });





    const user = await this.auth.getUserCurrent();
    this.register.findTeacherById(user!.uid)
      .pipe(
        tap((resp: any) => {
          console.log("teacherResp", resp);

          return Promise.resolve(resp);
        }),
        catchError((err) => {
          console.log(err);
          return Promise.reject(err);
          return of(null);
        }
        )
      ).subscribe();


    return Promise.reject("Error al cargar el tutor");


    // console.log("teacherResp", teacherResp);

    // return teacherResp;


  }

}
