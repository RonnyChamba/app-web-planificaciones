import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MAX_EMAIL } from 'src/app/util/constantes-values';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  formGroup: FormGroup;
  
  mensajesValidacion = validMessagesError;
  
  constructor(

    private authService: LoginService,
    public modal: NgbActiveModal,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.formGroup = new FormGroup({
      email: new FormControl(null, [  Validators.required , Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'), Validators.maxLength(MAX_EMAIL)]),
    });
  }

  async  onSubmit() {
    if (this.formGroup.valid) {


      try {
        await this.authService.resetPassword(this.formGroup.value.email);
        this.modal.close();
        this.toaster.info('Se envio un correo para restablecer su contraseña');


      } catch (error) {

        this.modal.close();
        this.toaster.error('No se pudo enviar el correo', 'Error');
        console.log(error);
      }





      this.modal.close();
    }
  }

}
