import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';;
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import * as dayjs from "dayjs";
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { PeriodosService } from 'src/app/modules/admin/services/periodos.service';
import { ToastrService } from 'ngx-toastr';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';

@Component({
  selector: 'app-register-periodos',
  templateUrl: './register-periodos.component.html',
  styleUrls: ['./register-periodos.component.scss']
})
export class RegisterPeriodosComponent implements OnInit {

  formGroup: FormGroup;
  mensajesValidacion = validMessagesError;


  // REGISTER OR UPDATE_PROFILE

  @Input() data: any;

  constructor(
    private periodoService: PeriodosService,
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    private messageService: MensajesServiceService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.formGroup.get("dateBegin")?.valueChanges.subscribe((value) => {
      console.log(value);
      this.formGroup.get("dateEnd")?.updateValueAndValidity({ emitEvent: false });
    });

    if (this.data.action == 'UPDATE') {
      this.editForm();
    }

  }


  private editForm() {
    const ide = this.data.id;

    if (ide) {

      this.periodoService.getPeriodo(ide).subscribe((data: any) => {
        console.log(data);
        this.formGroup.patchValue(data);
      });
    }

  }
  createForm() {
    this.formGroup = new FormGroup({
      title: new FormControl(null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ], []),

      description: new FormControl('',
        [
          Validators.maxLength(200)
        ]),

      current: new FormControl(false, [Validators.required]),

      dateBegin: new FormControl([],
        [Validators.required]),
      dateEnd: new FormControl(null,
        [Validators.required, this.validatorDate()]),
    });
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      if (this.data.action == 'CREATE') {

        // this.messageService.loading(true, "Guardando periodo académico");
        await this.saveData();
      } else if (this.data.action == 'UPDATE') {
        // this.messageService.loading(true, "Actualizando periodo académico");
        await this.updateData();
      }

      // this.messageService.loading(false);

    } else {
      // this.toastr.error('Formulario no valido', 'Formulario no valido', { timeOut: 3000, });
      console.log('Formulario no valido');
    }

  }

  async saveData() {

    try {

      const data = {
        ...this.formGroup.value,
        status: true, // registro activo de eliminacion logica
        timestamp: dayjs().toDate()
      }
      const newPeriodo = await this.periodoService.savePeriodo(data);
      console.log(newPeriodo);
      this.modal.close();
      this.toastr.info('Periodo creado correctamente', '', { timeOut: 3000, });
    } catch (error) {
      console.log(error);
      this.toastr.error('Error al crear periodo', 'Error', { timeOut: 3000, });
    }

  }

  async updateData() {
    const id = this.data.id;

    const data = {
      ...this.formGroup.value,
      status: true, // registro activo de eliminacion logica
    }

    try {
      const newPeriodo = await this.periodoService.updatePeriodo(id, data);
      console.log(newPeriodo);
      this.modal.close();
      this.toastr.info('Periodo actualizado correctamente', '', { timeOut: 3000, });
    } catch (error) {
      console.log(error);
      this.toastr.error('Error al actualizar periodo', 'Error', { timeOut: 3000, });
    }

  }

  validatorDate(): ValidatorFn {
    return (dateEndConntrol: AbstractControl): ValidationErrors | null => {


      if (dateEndConntrol.touched && dateEndConntrol.value) {

        const dateBeginValue = this.formGroup.get('dateBegin')?.value;
        // Se debe cargarte el modulo previamennte antes de utilizar
        dayjs.extend(isSameOrAfter);

        if (dateBeginValue) {

          // transformar a date
          let dateEnd = dayjs(dateEndConntrol.value);
          let dateBegin = dayjs(dateBeginValue);

          if (dateEnd.isBefore(dateBegin)) {
            return { 'dateEndWrong': "Fecha fin no puede ser menor a fecha inicio" };
          }
        }

      }
      return null;
    };
  }

}
