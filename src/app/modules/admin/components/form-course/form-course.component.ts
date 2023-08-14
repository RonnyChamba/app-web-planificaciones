import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { CourseService } from '../../services/course.service';
import { WeekService } from '../../services/week.service';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CourseModel } from '../../models/course.model';
import { WeekModelBase } from '../../models/week.model';
import * as dayjs from 'dayjs';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import Swal from 'sweetalert2';
import { ReportService } from '../../services/report.service';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrls: ['./form-course.component.scss'],
})
export class FormCourseComponent implements OnInit {
  formGroup: FormGroup;

  teachers: ModelTeacher[] = [];

  @Input('courseEdit') courseEdit: any;

  mensajesValidacion = validMessagesError;
  constructor(
    private toastr: ToastrService,
    private teacherService: RegisterService,
    private courseService: CourseService,
    private weekService: WeekService,
    public modal: NgbActiveModal,
    private tokenService: TokenService,
    private reportService: ReportService,
    private messageService: MensajesServiceService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadTeachers();
    this.onValueChange();

    this.editFormCourse();
  }

  loadTeachers() {
    this.teacherService.findAllTeachers().subscribe((resp) => {
      // console.log(resp);

      resp.docs.forEach((item: any) => {
        this.teachers.push(item.data() as ModelTeacher);
      });

      // Asi se agrega un elemento al inicio del arreglo, el dni no tiene importancia ya que no se usara
      this.teachers.unshift({
        displayName: 'Seleccione un tutor para el curso ...',
        uid: '',
        dni: '',
      });
    });
  }

  onValueChange() {
    this.formGroup.get('name')?.valueChanges.subscribe((value) => {
      // Actualizamos el valor del input con el valor en mayusculas, pero sin emitir el evento para evitar un bucle infinito
      this.formGroup
        .get('name')
        ?.setValue(value.toUpperCase(), { emitEvent: false });
    });

    this.formGroup.get('parallel')?.valueChanges.subscribe((value) => {
      // Actualizamos el valor del input con el valor en mayusculas, pero sin emitir el evento para evitar un bucle infinito
      this.formGroup
        .get('parallel')
        ?.setValue(value.toUpperCase(), { emitEvent: false });
    });
  }

  createForm() {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(25),
      ]),
      parallel: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1),
      ]),
      tutor: new FormControl('', []),
    });
  }

  editFormCourse() {
    console.log(this.courseEdit);

    if (this.courseEdit) {
      this.formGroup.patchValue(
        {
          name: this.courseEdit.name,
          parallel: this.courseEdit.parallel,
          tutor: this.courseEdit.tutor.uid || '',
        },
        { emitEvent: false }
      );
    }
  }
  async onSubmit() {
    if (this.formGroup.valid) {
      if (this.courseEdit) {
        await this.updateCourse();
        return;
      }

      const periodo = JSON.parse(
        this.tokenService.getCurrentPeriodo() as string
      );

      console.log(periodo);

      if (!periodo) {
        Swal.fire({
          icon: 'info',
          title: 'Oops...',
          text: 'No se ha seleccionado un periodo académico actual, por favor seleccione uno',
        });

        return;
      }

      try {
        this.courseService
          .findCouseByNameAndParalelo(
            this.formGroup.value.name,
            this.formGroup.value.parallel
          )
          .subscribe(async (resp) => {
            console.log(resp);
            if (resp.empty) {
              // this.formGroup.value.name = (this.formGroup.value.name as string).toUpperCase();
              // this.formGroup.value.parallel = (this.formGroup.value.parallel as string).toUpperCase();

              const course: CourseModel = this.formGroup.value;

              if (this.formGroup.value.tutor != '') {
                const teacher = this.teachers.find(
                  (item) => item.uid === this.formGroup.value.tutor
                );
                course.tutor = {
                  uid: teacher?.uid,
                  fullName: `${teacher?.displayName} ${teacher?.lastName} `,
                };
              } else {
                // asi se inicializa un objeto vacio, indica que el curso no tiene tutor
                course.tutor = {
                  uid: '',
                  fullName: '',
                };
              }

              course.periodo = periodo.id;

              const resp = await this.courseService.saveCourse(course);
              console.log(resp, resp.id);

              const weeks: WeekModelBase[] = [];

              for (let i = 0; i < 3; i++) {
                const timestamp = dayjs()
                  .add(i + 1, 'minute')
                  .valueOf();

                const week: WeekModelBase = {
                  title: 'Trimestre ' + (i + 1),
                  details: 'Sin detalles',
                  numberWeek: i + 1,
                  course: resp.id,
                  timestamp,
                };

                weeks.push(week);
              }

              for (const item of weeks) {
                await this.weekService.saveWeek(item);
              }

              this.toastr.success(
                'Curso creado correctamente',
                'Curso creado correctamente',
                { timeOut: 3000 }
              );
              this.modal.close();
            } else {
              this.toastr.error('El curso ya existe', 'Error', {
                timeOut: 3000,
              });
            }
          });
      } catch (error: any) {
        this.toastr.error(error.message, 'Error', { timeOut: 3000 });
      }
    } else {
      this.toastr.error('Formulario no valido', 'Formulario no valido', {
        timeOut: 3000,
      });
      console.log('Formulario no valido');
    }
  }

  async updateCourse() {
    this.modal.close();

    this.messageService.loading(true, 'Actualizando curso ....');

    setTimeout(  async () => {
      const course: CourseModel = this.formGroup.value;

      if (this.formGroup.value.tutor != '') {
        const teacher = this.teachers.find(
          (item) => item.uid === this.formGroup.value.tutor
        );
        course.tutor = {
          uid: teacher?.uid,
          fullName: `${teacher?.displayName} ${teacher?.lastName} `,
        };
      } else {
        // asi se inicializa un objeto vacio, indica que el curso no tiene tutor
        course.tutor = {
          uid: '',
          fullName: '',
        };
      }

      try {
        const resp = await this.courseService.updateCourse(
          this.courseEdit.uid,
          course
        );

        console.log('Curso actualizado con exito ....');

        // verificar si el curso almacenado en  el localstorage es el mismo que se actualizo
        const courseCurrent = JSON.parse(
          this.tokenService.getCourse() as string
        );

        if (courseCurrent) {
          if (courseCurrent.uid == this.courseEdit.uid) {
            this.tokenService.setCourse({
              uid: this.courseEdit.uid,
              name: course.name + ' ' + course.parallel,
            });
          }
        }

        console.log('Curso token actualizado con exito ....');

        // Actualizar en reportes los registros donde el nombre del curso  se igual al actualizado recientemente
        const updateReporName = await this.reportService.updateNameCourse(
          this.courseEdit.uid,
          course
        );
        console.log('Nombre de reporte actualizado', updateReporName);

        this.toastr.success('Curso actualizado correctamente', '', {
          timeOut: 3000,
        });
      } catch (err: any) {
        console.log(err);

        this.toastr.error('Error al actualizar el curso', '', {
          timeOut: 3000,
        });
      } finally {
        this.messageService.loading(false);
      }
    }, 1200);

    console.log('Fin  actualizado curso ....');
  }
}
