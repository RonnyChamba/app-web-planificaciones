import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { MAX_EMAIL, MIN_EMAIL } from 'src/app/util/constantes-values';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { RegisterService } from '../../teacher/services/register.service';
import { catchError, of, tap } from 'rxjs';
import { AuthCredential } from '../models/auth.model';
import { ModelTeacher } from '../../teacher/models/teacher';

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
    private router: Router) { }

  ngOnInit(): void {

    this.createForm();

  }

  createForm() {
    this.formGroup = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'), Validators.maxLength(MAX_EMAIL)],),
      password: new FormControl('', [Validators.required, Validators.minLength(MIN_EMAIL)]),
    });

  }


  async onSubmit() {

    // console.log(this.formGroup.value);

    if (this.formGroup.valid) {

      try {


        const res = await this.loginService.login(this.formGroup.value.email, this.formGroup.value.password);
        // Obtener los roles del usuario
        const teacher = this.registerService.findTeacherById(res.user?.uid!);

      await teacher.forEach(async (resp) => {

          if (resp.exists) {
            const data = resp.data();
            console.log(data);
            this.token = {
              uid: res.user?.uid!,
              email: res.user?.email!,
              rol: data.rol,
            }
          } else {

            // Si no existe el usuario en la base de datos se cierra la sesión que fue abierta
            await this.loginService.logOut();
            this.tokenService.clearLocalStorage();
            this.toastr.error('Error de credenciales', 'Login');
            this.router.navigate(['/auth']);

            return;
          }
        })


        // console.log(this.token);
      
        this.tokenService.setToken(JSON.stringify(this.token));
        this.toastr.success('Bienvenido', 'Login');
        this.updateProfile();
        
        this.router.navigate(['/']);


      } catch (error) {
        this.tokenService.clearLocalStorage();
        // this.tokenService.setToken("null");
        this.toastr.error('Error de credenciales', 'Login');

      }
    }

  }

/**
 * Cuando se loguea por primera el usuario no va a tener un displayName
 * por lo que se va a consultar a la base de datos para obtener el nombre
 * y se va a actualizar el usuario, solo si no tiene un displayName
 */
  async updateProfile() {

    const user = await this.loginService.getUserCurrent();
    // console.log(user);
    if (user) {
      if (!user.displayName) {
        this.registerService.findTeacherById(user.uid)
          .pipe(
            tap((resp: any) => {
              // console.log(teacher.data());

              const teacher = resp.data() as ModelTeacher;
              // console.log(teacher);

              if (teacher) {

                user.updateProfile({
                  displayName: teacher.displayName + " " + teacher.lastName,
                }).then(() => {
                  // console.log("se actualizo el usuario");
                  // this.toastr.success('Se actualizo el usuario', 'Login');
                }).catch((error) => {
                  // console.log(error);
                  this.toastr.error('Error al actualizar el usuario', 'Login');
                })
              }
            }),
            catchError((error) => {
              console.log(error);

              return of(null)
            })
          ).subscribe();

      }

    } else this.toastr.error('No se pudo obtener el usuario', 'Login');
  }

}
