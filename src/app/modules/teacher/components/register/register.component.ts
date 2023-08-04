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
  MIN_EMAIL,
  MIN_NAME,
  MIN_PASSWORD,
} from 'src/app/util/constantes-values';
import { validatorDni } from 'src/app/util/group-validacion';
import { dniOrEmailValidator } from '../../util/validator';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { ModelTeacher } from '../../models/teacher';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { catchError, of, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {


  formGroup: FormGroup;
  mensajesValidacion = validMessagesError;


  // REGISTER OR UPDATE_PROFILE
  action = 'REGISTER';

  constructor(
    public modal: NgbActiveModal,
    private registerService: RegisterService,
    private auhtService: LoginService,
    private router: Router,
    private tokenService: TokenService,

    private toastr: ToastrService) { }

  ngOnInit() {
    this.createForm();
    this.upperCase();
    this.setStatusControlsWhenActionIsUpdate();
    this.setDataWhenActionIsUpdate();


  }


  upperCase() {

    this.formGroup.get('displayName')?.valueChanges.subscribe((value: string) => {
      this.formGroup.get('displayName')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
    );

    this.formGroup.get('lastName')?.valueChanges.subscribe((value: string) => {
      this.formGroup.get('lastName')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
    );

  }

  setStatusControlsWhenActionIsUpdate() {

    if (this.action == 'UPDATE_PROFILE') {
      this.formGroup.get('dni')?.disable();
      this.formGroup.get('email')?.disable();
      this.formGroup.get('password')?.disable();
    }
  }

  createForm() {
    this.formGroup = new FormGroup({
      dni: new FormControl(null, [Validators.required,
      Validators.pattern(`^[0-9]{${MIN_CEDULA}}$`),
      validatorDni()],
        [dniOrEmailValidator(this.registerService, 'DNI')]),
      displayName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME),
      Validators.maxLength(MAX_NAME)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME),
        Validators.maxLength(MAX_NAME)]),

      password: new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD), Validators.maxLength(MAX_PASSWORD)]),
      email: new FormControl('',
        [Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'),  Validators.minLength(MIN_EMAIL), Validators.maxLength(MAX_EMAIL)],
        [dniOrEmailValidator(this.registerService, 'EMAIL')],
      ),
      phoneNumber: new FormControl('', [Validators.pattern(`^[0-9]{${MAX_TELEPHONE}}$`)]),
      role: new FormControl('USER', [Validators.required]),

      flagTitulo: new FormControl('', []),

      titles: new FormControl([], []),

    });
  }

  async onSubmit() {

    console.log(this.formGroup.value);
    if (this.formGroup.valid) {


      if (this.action == 'REGISTER') {

        await this.saveNewData();

      } else if (this.action == 'UPDATE_PROFILE') {

         this.updateData();

      }


    } else {
      this.toastr.error('Formulario no valido', 'Formulario no valido', { timeOut: 3000, });
      console.log('Formulario no valido');
    }

  }

  private generarUserData(result: any): ModelTeacher {

    const teacher: ModelTeacher = this.formGroup.value;

    const newTeacher: ModelTeacher = {
      uid: result.user?.uid,
      displayName: result.user?.displayName || teacher.displayName,
      lastName: teacher.lastName,
      emailVerified: result.user?.emailVerified,
      status: true,
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

  setDataWhenActionIsUpdate() {

    if (this.action == 'UPDATE_PROFILE') {


      this.auhtService.getUserCurrent()

        .then((userCurrent) => {

          const uid = userCurrent?.uid;

          this.registerService.findTeacherById(uid as string)
            .pipe(
              tap((resp) => {

                const teacher = resp.data();

                console.log(teacher);

                this.formGroup.get('dni')?.setValue(teacher?.dni);
                this.formGroup.get('displayName')?.setValue(teacher?.displayName);
                this.formGroup.get('lastName')?.setValue(teacher?.lastName);
                this.formGroup.get('email')?.setValue(teacher?.email);
                this.formGroup.get('phoneNumber')?.setValue(teacher?.phoneNumber);
                this.formGroup.get('titles')?.setValue(teacher?.titles);
              }
              ),
              catchError((error) => {

                console.log(error);
                this.toastr.error('Surgio un error, intentelo más tarde', 'Error', { timeOut: 3000, });
                this.modal.close();

                return of(null);
              }
              )
            ).subscribe();





        }).catch((error) => {
          console.log(error);
          this.toastr.error('Surgio un error, intentelo más tarde', 'Error', { timeOut: 3000, });
          this.modal.close();

        }
        );


    }
  }


  async saveNewData() {

    try {
      const teacher: ModelTeacher = this.formGroup.value;

      const result = await this.auhtService.createAccount(teacher.email as string, teacher.password as string);
      if (result) {

        const newTeacher: ModelTeacher = this.generarUserData(result);
        await this.auhtService.saveUserData(newTeacher);

        this.modal.close();

        this.toastr.info("Docente registrado con exito");

        await this.auhtService.logOut();

        // Autentico de nuevo al usuario actual
        const password = this.registerService.passwordSession;
        const email = JSON.parse(this.tokenService.getToken()!).email;
        await this.auhtService.login(email, password);

        const userCurrent = await this.auhtService.getUserCurrent();
        console.log(userCurrent);
      }

    } catch (error: any) {
      this.toastr.error(error.message, 'Error', { timeOut: 3000, });
    }
  }

  updateData() {



    Swal.fire({
      title: '¿Estas seguro?',
      text: "¿Desea actualizar sus datos?, tendrá que iniciar sesión nuevamente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',

      confirmButtonText: 'Si, actualizar',
      cancelButtonText: 'Cancelar'
    }).then( async (result) => {
      if (result.isConfirmed) {
        try {

          const teacher: ModelTeacher = this.formGroup.value;
          const userCurrent = await this.auhtService.getUserCurrent();
          await this.registerService.updateTeacherPart(teacher, userCurrent?.uid as string);

          await userCurrent?.updateProfile({
            displayName: teacher.displayName +  ' ' + teacher.lastName,
          });

          this.modal.close();
          this.toastr.info("Sus datos fuerón actualizados con exito");

          await this.auhtService.logOut();
          this.tokenService.clearLocalStorage();
          this.registerService.passwordSession = "";
          this.router.navigate(['/auth']);

        } catch (error) {
          
          this.toastr.error("Error al actualizar datos", 'Error', { timeOut: 3000, });
          this.modal.close();
        }
      }
    })





  }

}
