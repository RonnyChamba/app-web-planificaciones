import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { MAX_EMAIL, MAX_PASSWORD, MIN_EMAIL, MIN_PASSWORD } from 'src/app/util/constantes-values';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { RegisterService } from '../../teacher/services/register.service';
import { AuthCredential } from '../models/auth.model';
import { ModelTeacher } from '../../teacher/models/teacher';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordComponent } from '../components/reset-password/reset-password.component';
import Swal from 'sweetalert2';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  formGroup: FormGroup;
  mensajesValidacion = validMessagesError;
  token: AuthCredential;

  constructor(private loginService: LoginService,
    private toastr: ToastrService,
    private tokenService: TokenService,
    private registerService: RegisterService,
    private router: Router,
    private modal: NgbModal,
    private mensajeService: MensajesServiceService
  ) { }

  ngOnInit(): void {

    this.createForm();
    this.onValidField();
  }

  createForm() {
    this.formGroup = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'), Validators.maxLength(MAX_EMAIL)],),
      password: new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD), Validators.maxLength(MAX_PASSWORD)]),
    });

  }

  private onValidField() {

    // limita los espacios en blanco
    this.formGroup.controls['email'].valueChanges.subscribe((value) => {
      if (value) {

        const email = value.trim();
        this.formGroup.controls['email'].setValue(email, { emitEvent: false });

    
      }
    }
    );
    this.formGroup.controls['password'].valueChanges.subscribe((value) => {

      if (value) {

        const password = value.trim();
        
        this.formGroup.controls['password'].setValue(password, { emitEvent: false });
      }
    }
    );


  }


  async onSubmit() {

    // console.log(this.formGroup.value);

    this.mensajeService.loading(true, "Verificando credenciales");

    if (this.formGroup.valid) {

      try {


        const res = await this.loginService.login(this.formGroup.value.email, this.formGroup.value.password);

        // Obtener los roles del usuario
        const teacher = this.registerService.findTeacherById(res.user?.uid!);

        let teacherData: ModelTeacher | undefined;

        await teacher.forEach(async (resp) => {

          if (resp.exists) {

            const data = resp.data();
            teacherData = data;

            this.token = {
              uid: res.user?.uid!,
              email: res.user?.email!,
              rol: data.rol,
            }
          }
        })

        // usuario no existe en la base de datos
        if (!teacherData) {

          await this.errorLogin("Error de credenciales");
          return;
        }

        // validar si el usuario esta activo

        if (!teacherData.status) {
          await this.errorLogin("Usuario inactivo");
          return;
        }

        this.tokenService.setToken(JSON.stringify(this.token));

        // Si el usuario es admin se guarda la contraseña en el servicio para que pueda ser usada en el componente
        // de crear usuario y poder loguearse  automaticamente
        if (teacherData.rol == 'ADMIN') {
          this.registerService.passwordSession = this.formGroup.value.password;
        }
        this.updateProfile(teacherData);
        // this.toastr.success('Bienvenido', 'Login');

        this.mensajeService.loading(false);

        this.router.navigate(['/']);


      } catch (error) {
        this.tokenService.clearLocalStorage();
        this.mensajeService.loading(false);
        this.toastr.error('Error de credenciales', 'Login');

      }
    }

  }

  /**
   * Cuando se loguea por primera el usuario no va a tener un displayName
   * por lo que se va a consultar a la base de datos para obtener el nombre
   * y se va a actualizar el usuario, solo si no tiene un displayName
   */
  async updateProfile(teacherData: ModelTeacher) {

    const user = await this.loginService.getUserCurrent();

    console.log(user);
    if (user) {
      console.log(user.displayName);
      if (!user.displayName) {

        user.updateProfile({
          displayName: teacherData.displayName + " " + teacherData.lastName,
        }).then(() => {
          // console.log("se actualizo el usuario");
          // this.toastr.success('Se actualizo el usuario', 'Login');
        }).catch((error) => {
          // console.log(error);
          this.toastr.error('Error al actualizar el usuario', 'Login');
        })
      }

    } else this.toastr.error('No se pudo obtener el usuario', 'Login');
  }

  async errorLogin(error: string) {

    // Si no existe el usuario en la base de datos se cierra la sesión que fue abierta
    await this.loginService.logOut();
    this.tokenService.clearLocalStorage();
    this.toastr.error(error, 'Login');
    this.registerService.passwordSession = '';
    this.router.navigate(['/auth']);
  }

  resetPassword() {

    // alert("Se envio un correo para restablecer la contraseña");

    this.modal.open(ResetPasswordComponent, { size: 'md' });



  }
}
