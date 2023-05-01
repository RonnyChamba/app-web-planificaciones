import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';

import {
  MAX_EMAIL,
  MAX_NAME,
  MAX_PASSWORD,
  MAX_TELEPHONE,
  MIN_CEDULA,
  MIN_NAME,
  MIN_PASSWORD,
} from 'src/app/util/constantes-values';
import { validatorDni } from 'src/app/util/group-validacion';
import { dniOrEmailValidator } from '../../util/validator';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { ModelTeacher } from '../../models/teacher';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilDetailsService } from 'src/app/modules/admin/services/util-details.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {


  formGroup: FormGroup;

  mensajesValidacion = validMessagesError;

  constructor(
    public modal: NgbActiveModal,
    private registerService: RegisterService,
    private auhtService: LoginService,
    private utilService: UtilDetailsService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.createForm();


  }

  createForm() {
    this.formGroup = new FormGroup({
      dni: new FormControl(null, [Validators.required,
      Validators.pattern(`^[0-9]{${MIN_CEDULA}}$`),
      validatorDni()],
        [dniOrEmailValidator(this.registerService, 'DNI')]),
      displayName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME),
      Validators.maxLength(MAX_NAME)]),
      lastName: new FormControl('', [Validators.required]),

      password: new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD), Validators.maxLength(MAX_PASSWORD)]),
      email: new FormControl('',
        [Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'), Validators.maxLength(MAX_EMAIL)],
        [dniOrEmailValidator(this.registerService, 'EMAIL')],
      ),
      phoneNumber: new FormControl('', [Validators.pattern(`^[0-9]{${MAX_TELEPHONE}}$`)]),

      flagTitulo: new FormControl('', []),
      titles: new FormControl([], []),

    });
  }

  async onSubmit() {

    console.log(this.formGroup.value);
    if (this.formGroup.valid) {
     
    
      try {
        const teacher: ModelTeacher = this.formGroup.value;

        const result = await this.auhtService.createAccount(teacher.email as string, teacher.password as string);
        if (result) {
          
          const newTeacher: ModelTeacher = this.generarUserData(result);
         await this.auhtService.saveUserData(newTeacher);

         this.modal.close();

          this.toastr.info("Docente registrado con exito");

          // paso el uid del docente para que se actualice la lista de docentes en el componente list-teacher
          this.utilService.refreshDataTeacher.next(result.user?.uid);


        }
        // console.log(result);

      } catch (error: any) {

        this.toastr.error(error.message, 'Error', { timeOut: 3000, });

      }

    } else {
      this.toastr.error('Formulario no valido', 'Formulario no valido', { timeOut: 3000, });
      console.log('Formulario no valido');
    }

  }

  private generarUserData(  result:any): ModelTeacher {

    const teacher: ModelTeacher = this.formGroup.value;

    const newTeacher: ModelTeacher = {
      uid: result.user?.uid,
      displayName: result.user?.displayName || teacher.displayName,
      lastName: teacher.lastName,
      emailVerified: result.user?.emailVerified,
      dni: teacher.dni,
      email: result.user?.email as string,
      photoURL: result.user?.photoURL as string,
      phoneNumber: result.user?.phoneNumber || teacher.phoneNumber,
      titles: teacher.titles,
    };

    return newTeacher;

  }

  agregarTexto(texto: string): void {
    const arrayActual = this.formGroup.get('titles')?.value;
    arrayActual.push(texto);
    this.formGroup.get('titles')?.setValue(arrayActual);

    this.formGroup.get('flagTitulo')?.reset();
  }

  get arrayTitulos(): string[] {
    return this.formGroup.get('titles')?.value;
  }

  eliminarTitulo(index: number): void {
    const arrayActual = this.formGroup.get('titles')?.value;
    arrayActual.splice(index, 1);
    this.formGroup.get('titles')?.setValue(arrayActual);
  }

}
