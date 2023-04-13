import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CourseModel } from '../../models/course.model';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WeekService } from '../../services/week.service';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { WeekModel, WeekModelBase } from '../../models/week.model';
import { UtilDetailsService } from '../../services/util-details.service';

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})
export class WeekComponent implements OnInit {

  formGroup: FormGroup;
  @Input() courseModel: CourseModel;
  mensajesValidacion = validMessagesError;
  constructor(
    private toastr: ToastrService,
    private weekService: WeekService,
    private utilDetailsService: UtilDetailsService,
    public modal: NgbActiveModal) { }

  ngOnInit() {

    this.createForm();
    this.countWeeks();
    this.disableControls();


  }
  createForm() {
    this.formGroup = new FormGroup({
      title: new FormControl("Trimestre", [Validators.required]),
      details: new FormControl(null, []),
      numberWeek: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]*$')]),

      // Este nombre solo es para visualizarlo en el formulario no se guarda en la base de datos
      nameCourse: new FormControl(`${this.courseModel.name} ${this.courseModel.parallel}`, []),
      course: new FormControl(this.courseModel.uid, []),
    });

  }


  countWeeks() {

    // count  number weeeks exist
    this.weekService.findWeeksByCourseId(this.courseModel.uid as string).subscribe((data) => {
      console.log(data.docs.length);
      this.formGroup.controls['numberWeek'].setValue(data.docs.length + 1);
    }
    );
  }

  private disableControls() {

    this.formGroup.controls['numberWeek'].disable();
    this.formGroup.controls['nameCourse'].disable();

  }

  onSubmit() {

    console.log(this.formGroup.value);

    if (this.formGroup.valid) {
      const week: WeekModelBase = this.formGroup.value;
      week.numberWeek = this.formGroup.controls['numberWeek'].value;
      week.timestamp = Date.now();

      console.log(week);

      this.weekService.saveWeek(week).then((data) => {
        this.toastr.success('Trimestre creado correctamente', 'Exito');


        this.modal.dismiss();
        this.utilDetailsService.refreshDataWeek.next();
      }).catch((error) => {
        this.toastr.error('Error al crear trimestre', 'Error');
      });



    } else {
      this.toastr.error('Formulario no valido', 'Error');
    }

  }

}
