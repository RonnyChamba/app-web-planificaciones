import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { MAX_EMAIL, MIN_EMAIL } from 'src/app/util/constantes-values';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  implements  OnInit{


  formGroup: FormGroup;
  mensajesValidacion =  validMessagesError;

  constructor(private loginService: LoginService,
    private toastr: ToastrService,
    private tokenService: TokenService,
    private router: Router) { }

  ngOnInit(): void {

    this.createForm();
  
}

createForm() {
  this.formGroup = new FormGroup({
    email: new FormControl('',  [ Validators.required,  Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'),Validators.maxLength(MAX_EMAIL)],),
    password: new FormControl('', [Validators.required, Validators.minLength(MIN_EMAIL)]),
  });
  
}


  async  onSubmit() {
    
    console.log(this.formGroup.value);

    if (this.formGroup.valid) {

      try {
        

        const res = await this.loginService.login(this.formGroup.value.email, this.formGroup.value.password);
        console.log(res);
        this.toastr.success('Bienvenido', 'Login');
        
        this.tokenService.setToken(JSON.stringify(res.user));

        this.router.navigate(['/home']);

      } catch (error) {
        this.tokenService.setToken("null");

        // console.log(error);
        this.toastr.error('Error de credenciales', 'Login');
        
      }
    }

  }

}
