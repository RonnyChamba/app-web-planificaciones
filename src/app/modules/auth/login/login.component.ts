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
import { ModelBaseTeacher, ModelTeacher } from '../../teacher/models/teacher';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  formGroup: FormGroup;
  mensajesValidacion = validMessagesError;

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

    console.log(this.formGroup.value);

    if (this.formGroup.valid) {

      try {


        const res = await this.loginService.login(this.formGroup.value.email, this.formGroup.value.password);
        console.log(res);
        this.toastr.success('Bienvenido', 'Login');

        this.tokenService.setToken(JSON.stringify(res.user));

        this.updateProfile();
      
        this.router.navigate(['/']);


      } catch (error) {
        this.tokenService.setToken("null");

        // console.log(error);
        this.toastr.error('Error de credenciales', 'Login');

      }
    }

  }


  async updateProfile() {

    const user = await this.loginService.getUserCurrent();

    console.log(user);

    if (user) {

      // Cuando se loguea por primera el usuario no va a tener un displayName
      // por lo que se va a consultar a la base de datos para obtener el nombre
      // y se va a actualizar el usuario, solo si no tiene un displayName

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

    }else  this.toastr.error('No se pudo obtener el usuario', 'Login');
  }

}
