import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { ModelTeacher } from '../../models/teacher';
import { Subscription, catchError, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UtilDetailsService } from 'src/app/modules/admin/services/util-details.service';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-teacher',
  templateUrl: './list-teacher.component.html',
  styleUrls: ['./list-teacher.component.scss']
})
export class ListTeacherComponent implements OnInit, OnDestroy {

  listData: ModelTeacher[] = [];

  private subscription = new Subscription();

  constructor(
    private teacherService: RegisterService,
    private utilService: UtilDetailsService,
    private toaster: ToastrService,
    private loginService: LoginService


  ) { }


  ngOnInit(): void {
    this.findAllTeachers();
  }

  ngOnDestroy(): void {

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }



  findAllTeachers() {

    this.subscription = this.teacherService.findAllTeachersOnChanges()
      .pipe(
        tap(data => {

          this.listData = [];
          data.forEach((element: any) => {
            const teacher: ModelTeacher = element.payload.doc.data() as ModelTeacher;
            teacher.uid = element.payload.doc.id;
            this.listData.push(teacher);
          });
          this.truncateUserCurrent();
        })
        ,
        catchError(err => {
          console.log(err);
          this.toaster.error('Error al cargar los docentes', 'Error');
          // return [];
          return of(null);
        }
        )

      ).subscribe();

  }


  /**
   * Elimina el usuario actual para que no se muestre en la tabla
   */
  async truncateUserCurrent() {


    try {

      const userCurrent = await this.loginService.getUserCurrent();

      console.log('userCurrent', userCurrent);

      this.listData = this.listData.filter(teacher => teacher.uid != userCurrent?.uid);


      // const index = this.listData.findIndex(teacher => teacher.uid == userCurrent?.uid);

      // console.log('index', index);

      // if (index != -1) {
      //   this.listData.splice(index, 1);
      // }



    } catch (error) {

      console.log(error);
    }


  }
  delete(uid: any, status: any) {

    // console.log('uid', uid);
    try {



      Swal.fire({
        title: '¿Estas seguro?',
        text: `Estas seguro de ${status ? 'desactivar' : 'activar'} el docente`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',

        confirmButtonText: `${status ? 'Desactivar' : 'Activar'}`,
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {


          const foundTeacher = this.teacherService.findTeacherById(uid);

          foundTeacher.pipe(
            tap(data => {
              // console.log('data', data);
              const teacher: ModelTeacher = data.data();

              this.teacherService.updateStatusTeacher(uid, teacher.status ? false : true)
                .then(() => {
                  this.toaster.info('Estado actualizado', 'Exito');

                })
                .catch(err => {
                  // console.log(err);

                  this.toaster.error('No se pudo actualizar el estado', 'Error');
                });
              // console.log('teacher', teacher);
            }),
            catchError(err => {
              console.log(err);
              this.toaster.warning('El docente no existe', 'Error');
              // return [];
              return of(null);
            })
          ).subscribe();

        }
      });



    } catch (err) {
      console.log(err);

    }
  }


}
