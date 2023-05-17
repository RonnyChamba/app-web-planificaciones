import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MAX_EMAIL, MAX_PASSWORD, MIN_PASSWORD } from 'src/app/util/constantes-values';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { LoginService } from '../../services/login.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  formGroup: FormGroup;
  mensajesValidacion = validMessagesError;

  constructor(

    public modal: NgbActiveModal,
    private toaster: ToastrService,
    private authService: LoginService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();

    this.formGroup.get('password')?.valueChanges.subscribe(
      value => {
        this.formGroup.get('repeatPassword')?.updateValueAndValidity();
      }
    );



  }

  createForm() {
    this.formGroup = new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.maxLength(MAX_PASSWORD), Validators.minLength(MIN_PASSWORD)]),
      repeatPassword: new FormControl(null, [Validators.required,
      this.validatorPassword()]),
    });
  }

  validatorPassword(): ValidatorFn {
    return (repeatPassword: AbstractControl): ValidationErrors | null => {
      if (this.formGroup) {
        const password = this.formGroup.get('password')?.value;

        if (repeatPassword.value && repeatPassword.value != password) {
          return { 'mismatch': 'Contraseñas no coinciden' }

        }
      }

      return null;

    };
  }

  async onSubmit() {

    if (this.formGroup.valid) {

      this.modal.close(this.formGroup.value);

      try {

        const user = await this.authService.getUserCurrent();

        await user?.updatePassword(this.formGroup.value['password']);

        await this.authService.logOut();
        this.tokenService.clearLocalStorage();
        this.toaster.info('Contraseña actualizada exitosamente');
        this.router.navigate(['/auth']);

      } catch (error) {

        console.log('Error al actualizar contraseña:', error);
        this.toaster.error('Error al actualizar contraseña', 'Error');
        this.modal.close();
      }


      // this.authService.getUserCurrent().then((user) => {

      //   user?.updatePassword(this.formGroup.value['password']).then(() => {
      //     console.log('Contraseña actualizada exitosamente');

      //     this.toaster.success('Contraseña actualizada exitosamente', 'Contraseña actualizada');

      //     this.authService.logOut();
      //   }).catch((error) => {
      //     console.log('Error al actualizar contraseña:', error);
      //   });
      // }).catch((error) => {
      //   console.log('No se pudo obtener la referencia al usuario actual:', error);
      // });
      // // En el código anterior, newPassword es la nueva contraseña que deseas asignar al usuario.El método updatePassword devuelve una promesa que se resuelve cuando se completa la operación de actualización de contraseña.Si ocurre algún error, se rechaza la promesa y se puede manejar el error en el bloque catch.

    } else this.toaster.error('Formulario invalido', 'Error');
  }
}
