import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { CourseService } from '../../services/course.service';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { ModelBaseTeacher } from 'src/app/modules/teacher/models/teacher';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrls: ['./form-course.component.scss']
})
export class FormCourseComponent implements OnInit {


  formGroup: FormGroup;

  teachers: ModelBaseTeacher[] = [];


  mensajesValidacion = validMessagesError;
  constructor(  private toastr: ToastrService,
    private  teacherService: RegisterService,
    private courseService: CourseService) { }

  ngOnInit(): void {

    this.createForm();
    this.loadTeachers();
  }

  loadTeachers() {
    this.teacherService.findAllTeachers().subscribe( (resp) => {

        console.log(resp);
      
      resp.docs.forEach( (item: any) => {
        this.teachers.push(item.data() as ModelBaseTeacher);
      });

      this.teachers.unshift( { displayName:  "Seleccione un tutor para el curso ...", dni: ""})
    
    
    });
  }

  createForm() {
    this.formGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      parallel: new FormControl('', [Validators.required]),
      tutor: new FormControl('', []),
    });
  }


   onSubmit() {

    console.log(this.formGroup.value);
    if (this.formGroup.valid) {


      try {
      
      
        this.courseService.findCouseByNameAndParalelo((this.formGroup.value.name as string).toUpperCase(), 
        (this.formGroup.value.parallel as string).toUpperCase())
        .subscribe( async  (resp) => {
          console.log(resp);
          if (resp.empty) {

            this.formGroup.value.name = (this.formGroup.value.name as string).toUpperCase();
            this.formGroup.value.parallel = (this.formGroup.value.parallel as string).toUpperCase();
            const resp =  await this.courseService.saveCourse(this.formGroup.value);
            console.log(resp);
            this.toastr.success('Curso creado correctamente', 'Curso creado correctamente', { timeOut: 3000, });
            this.formGroup.reset();
          } else {
            this.toastr.error('El curso ya existe', 'Error', { timeOut: 3000, });
          }
        });
      } catch (error: any) {

        this.toastr.error(error.message, 'Error', { timeOut: 3000, });

      }

    } else {
      this.toastr.error('Formulario no valido', 'Formulario no valido', { timeOut: 3000, });
      console.log('Formulario no valido');
    }

  }

}


