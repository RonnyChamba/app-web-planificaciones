import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { ModelTeacher } from '../../models/teacher';
import { Subscription, catchError, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UtilDetailsService } from 'src/app/modules/admin/services/util-details.service';
import { LoginService } from 'src/app/modules/auth/services/login.service';

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

    this.addSubscription();

  }

  ngOnDestroy(): void {

    this.subscription.unsubscribe();
  }

  private addSubscription(): void {

    this.subscription.add(
      this.utilService.refreshDataTeacher.subscribe(res => {

        if (res) {

          console.log('refrescando uid del nuevo teacher', res);

          this.teacherService.findTeacherById(res)
            .pipe(
              tap(data => {
                const teacher: ModelTeacher = data.data();
                this.listData.push(teacher);
              }),
              catchError(err => {
                console.log(err);
                this.toaster.error('No se pudo actualizar la tabla', 'Error');
                // return [];
                return of(null);
              })
            ).subscribe();



          // this.findAllTeachers();
        }
      }
      )
    );
  }


  async findAllTeachers() {

    this.teacherService.findAllTeachers()
      .pipe(

        tap(data => {

          this.listData = [];
          data.forEach((element: any) => {
            const teacher: ModelTeacher = element.data();

            this.listData.push(teacher);
          });

          this.truncateUserCurrent();


        }),
        catchError(err => {
          console.log(err);
          this.toaster.error('Error al cargar los docentes', 'Error');
          // return [];
          return of(null);
        })
      ).subscribe();

  }


  /**
   * Elimina el usuario actual para que no se muestre en la tabla
   */
  async truncateUserCurrent() {


    try {

      const userCurrent = await this.loginService.getUserCurrent();

      console.log('userCurrent', userCurrent);

      const index = this.listData.findIndex(teacher => teacher.uid == userCurrent?.uid);

      console.log('index', index);

      if (index != -1) {
        this.listData.splice(index, 1);
      }



    } catch (error) {

      console.log(error);
    }


  }
  async delete(uid: any) {

    console.log('uid', uid);


    try {


      // const userCurrent = await this.loginService.getUserCurrent();
     // console.log('userCurrent', userCurrent);

     alert('¿falta de implementar, se debe revisar el estad?');
    } catch (err) {
      console.log(err);

    }



    // this.loginService.getUserCurrent().then(res => {

    //     console.log('res', res);

    //     if(res.uid === uid){
    //       this.toaster.error('No se puede eliminar el usuario actual', 'Error');
    //       return;

    //     }else{


    //       this.teacherService.deleteTeacher(uid)
    //       .then(() => {
    //         this.toaster.success('Docente eliminado', 'Éxito');
    //       })
    //       .catch(err => {
    //         console.log(err);
    //         this.toaster.error('Error al eliminar docente', 'Error');
    //       });
    //     }
    //   })


  }


}
