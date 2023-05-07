import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, of, tap } from 'rxjs';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';

@Component({
  selector: 'app-select-teacher',
  templateUrl: './select-teacher.component.html',
  styleUrls: ['./select-teacher.component.scss']
})
export class SelectTeacherComponent implements OnInit, OnDestroy {

  listData: ModelTeacher[] = [];
  listDataFilter: ModelTeacher[] = [];

  listSelected: string[] = [];

  private subscription = new Subscription();
  searchValue = new FormControl('');

  @Input() uidCourse: string = '';
  constructor(
    private teacherService: RegisterService,
    private toaster: ToastrService,
    public modal: NgbActiveModal


  ) { }
  ngOnInit(): void {
    this.findAllTeachers();

    this.searchValue.valueChanges.subscribe(value => {

      const newValue = value?.toUpperCase() || '';

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

    // alert(this.uidCourse);

    this.subscription = this.teacherService.findAllTeachersOnChanges()
      .pipe(
        tap(async (data) => {

          this.listData = [];
          // const userCurrent = await this.loginService.getUserCurrent();

          // const uid = userCurrent?.uid;

          data.forEach((element: any) => {
            const teacher: ModelTeacher = element.payload.doc.data() as ModelTeacher;
            teacher.uid = element.payload.doc.id;

            // if (teacher.uid != uid) {
            //   this.listData.push(teacher);
            // }


            // Para que no se muestre el docente que ya esta asignado al curso
            if (!teacher.courses?.includes(this.uidCourse)) {
              this.listData.push(teacher);
            }

            // this.listData.push( );
          });

          this.listDataFilter = this.listData;
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

  selectRow(event: any, uid: any) {


    if (this.listSelected.length == 0) {
      this.listSelected.push(uid);
    } else {

      const isChecked = event.target.checked;

      if (isChecked) {
        this.listSelected.push(uid);
      } else {
        const index = this.listSelected.indexOf(uid);
        if (index > -1) {
          this.listSelected.splice(index, 1);
        }
      }
    }

  }

 async asignar() {

    if (this.listSelected.length == 0) {
      this.toaster.warning('Debe seleccionar al menos un docente', 'Atención');
      return;
    }

    if (this.uidCourse == '') {
      this.toaster.warning('Debe seleccionar un curso', 'Atención');
      return;
    }


    await  Promise.all(this.listSelected.map(async uidTeacher => {

      try {


        // await this.courseTeacherService.setCourseTeacher(this.uidCourse, uidTeacher)
        // console.log('Docente asignado correctamente');
        // // this.toaster.info('Docente asignado correctamente', 'Éxito');

        await this.teacherService.updateCoursesTeacher(uidTeacher, this.uidCourse);
        // this.toaster.info('Docente asignado correctamente', 'Éxito');


      } catch (error) {
        console.log(error);
        this.toaster.error('Error al asignar docente', 'Error');
        return;
      }

    }));

    this.toaster.info('Docentes asignados correctamente');

    console.log("asifnnnnnn");
    this.modal.close(this.listSelected);
  }

}
