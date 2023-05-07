import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of } from 'rxjs';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { MIN_CEDULA, MIN_NAME, MAX_NAME, MIN_PASSWORD, MAX_PASSWORD, MAX_EMAIL, MAX_TELEPHONE } from 'src/app/util/constantes-values';
import { validatorDni } from 'src/app/util/group-validacion';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {

  formGroup: FormGroup;
  mensajesValidacion = validMessagesError;

  // REGISTER OR UPDATE_PROFILE
  action = 'UPDATE_PROFILE';
  constructor(

    private auhtService: LoginService,
    private registerService: RegisterService,
    private tokenService: TokenService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.createForm();
    this.upperCase();
    this.setStatusControlsWhenActionIsUpdate();
    this.setDataWhenActionIsUpdate();


  }

  createForm() {
    this.formGroup = new FormGroup({
      dni: new FormControl(null, [Validators.required,
      Validators.pattern(`^[0-9]{${MIN_CEDULA}}$`),
      validatorDni()]),
      displayName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME),
      Validators.maxLength(MAX_NAME)]),
      lastName: new FormControl('', [Validators.required]),

      password: new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD), Validators.maxLength(MAX_PASSWORD)]),
      email: new FormControl('',
        [Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'), Validators.maxLength(MAX_EMAIL)],
      ),
      phoneNumber: new FormControl('', [Validators.pattern(`^[0-9]{${MAX_TELEPHONE}}$`)]),
      role: new FormControl('USER', [Validators.required]),

      flagTitulo: new FormControl('', []),

      titles: new FormControl([], []),

    });
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
    this.formGroup.get('dni')?.disable();
    this.formGroup.get('email')?.disable();
    this.formGroup.get('password')?.disable();

  }

  setDataWhenActionIsUpdate() {


    const uidCurrentUser = JSON.parse(localStorage.getItem('user') as string)?.uid;

        this.registerService.findTeacherById(uidCurrentUser as string)
          .pipe(
            tap((resp) => {

              const teacher = resp.data();

              // console.log(teacher);

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

              return of(null);
            }
            )
          ).subscribe();
  }

  agregarTexto(texto: string): void {

    if (texto === '') {
      
      this.toastr.warning('Debe ingresar un titulo' , "",{ timeOut: 3000, });
      return;
    }
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

  async onSubmit() {

    console.log(this.formGroup.value);
    if (this.formGroup.valid) {
      this.updateData();

    } else {
      this.toastr.error('Formulario no valido', 'Formulario no valido', { timeOut: 3000, });
      console.log('Formulario no valido');
    }

  }
  updateData() {



    Swal.fire({
      title: '¿Estas seguro?',
      text: "¿Desea actualizar sus datos?, debera iniciar sesion nuevamente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',

      confirmButtonText: 'Si, actualizar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {

          const teacher: ModelTeacher = this.formGroup.value;
          const userCurrent = await this.auhtService.getUserCurrent();
          await this.registerService.updateTeacherPart(teacher, userCurrent?.uid as string);

          await userCurrent?.updateProfile({
            displayName: teacher.displayName + ' ' + teacher.lastName,
          });


          this.toastr.info("Sus datos fuerón actualizados con exito");

          await this.auhtService.logOut();
          this.tokenService.clearLocalStorage();
          this.registerService.passwordSession = "";
          this.router.navigate(['/auth']);

        } catch (error) {

          this.toastr.error("Error al actualizar datos", 'Error', { timeOut: 3000, });




        }
      }
    })





  }

}
