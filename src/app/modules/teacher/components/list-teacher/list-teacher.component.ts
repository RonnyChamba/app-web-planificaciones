import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { ModelTeacher } from '../../models/teacher';
import { Subscription, catchError, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UtilDetailsService } from 'src/app/modules/admin/services/util-details.service';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import Swal from 'sweetalert2';
import { FormControl } from '@angular/forms';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-list-teacher',
  templateUrl: './list-teacher.component.html',
  styleUrls: ['./list-teacher.component.scss']
})
export class ListTeacherComponent implements OnInit, OnDestroy {

  listData: ModelTeacher[] = [];
  listDataFilter: ModelTeacher[] = [];

  private subscription = new Subscription();

  searchValue =  new FormControl('');

  constructor(
    private teacherService: RegisterService,
    private toaster: ToastrService,
    private loginService: LoginService,
    private messageService: MensajesServiceService,
    private modal: NgbModal
  ) { }


  ngOnInit(): void {
    this.findAllTeachers();

    this.searchValue.valueChanges.subscribe(value => {

      const newValue = value?.toUpperCase()  || '';
      
      this.listDataFilter = this.listData;


      this.searchValue.setValue(newValue, { emitEvent: false });

      this.listDataFilter = this.listData.filter(teacher =>
        
        (teacher.displayName?.toUpperCase().includes(newValue)
        
        || teacher.lastName?.toUpperCase().includes(newValue)

        || teacher.dni?.toUpperCase().includes(newValue)
        )
        
        
        );
    }
    );
  }

  ngOnDestroy(): void {

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }



  findAllTeachers() {

    this.messageService.loading(true, 'Cargando docentes');
    this.subscription = this.teacherService.findAllTeachersOnChanges()
      .pipe(
        tap( async ( data) => {

          this.listData = [];
          const userCurrent = await this.loginService.getUserCurrent();

          const uid = userCurrent?.uid;

          data.forEach((element: any) => {
            const teacher: ModelTeacher = element.payload.doc.data() as ModelTeacher;
            teacher.uid = element.payload.doc.id;

            if (teacher.uid != uid) {
              this.listData.push(teacher);
            }

            // this.listData.push( );
          });

          this.listDataFilter = this.listData;
          this.messageService.loading(false);
        })
        ,
        catchError(err => {
          console.log(err);
          this.messageService.loading(false);
          this.toaster.error('Error al cargar los docentes', 'Error');
          // return [];
          return of(null);
        }
        )

      ).subscribe();

  }
  delete(uid: any, status: any) {

    // console.log('uid', uid);
    try {



      Swal.fire({
        title: '¿Estas seguro?',
        text: `Estas seguro de ${status ? 'DESACTIVAR' : 'ACTIVAR'} el docente`,
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


  editTeacher(item: any){
    const  modalRef = this.modal.open(RegisterComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.editTeacher = item;
    modalRef.componentInstance.action = 'EDIT';
  }
}
