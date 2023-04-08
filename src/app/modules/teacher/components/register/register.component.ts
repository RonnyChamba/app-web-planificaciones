import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { ToastrService } from 'ngx-toastr';
import { validMessagesError } from 'src/app/util/mensajes-validacion';

import {
  MAX_ADDRESS,
  MAX_DESCRIPTION,
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

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {


  formGroup: FormGroup;

  mensajesValidacion =  validMessagesError;

  constructor(private registerService: RegisterService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.createForm();


  }

  createForm() {
    this.formGroup = new FormGroup({
      cedula: new FormControl(null, [Validators.required, 
        Validators.pattern(`^[0-9]{${MIN_CEDULA}}$`),  
        validatorDni()],
        [dniOrEmailValidator(this.registerService, 'DNI')]),
      nombres: new FormControl('', [Validators.required,  Validators.minLength(MIN_NAME),
         Validators.maxLength(MAX_NAME)]),
      apellidos: new FormControl('', [Validators.required]),
      correo: new FormControl('', 
      [     Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'),Validators.maxLength(MAX_EMAIL)],
      [dniOrEmailValidator(this.registerService, 'EMAIL')],
      ),
      celular: new FormControl('', [Validators.pattern(`^[0-9]{${MAX_TELEPHONE}}$`)  ]),

      flagTitulo: new FormControl('', []),
      titulos: new FormControl([], []),

    });
  }

    onSubmit() {


      console.log(this.formGroup.value);
    if (this.formGroup.valid) {

      // return a object with data
      this.registerService.findTeacher(this.formGroup.value.cedula).subscribe((data) => {
    
      
        // console.log(data.data());
        if (data.exists) {
          console.log('Ya existe');
          this. toastr.error('Ya existe', 'Ya existe', {  timeOut: 3000,  });
        }
        else {
      
          this.registerService.saveTeacher(this.formGroup.value).then((data) => {
            console.log('Registro exitoso');


            this.toastr.success('Registro exitoso', 'Registro exitoso', {  timeOut: 3000,  });
          });
        }
      });

    } else {
      this.toastr.error('Formulario no valido', 'Formulario no valido', {  timeOut: 3000,  });
      console.log('Formulario no valido');
    }

  }

  agregarTexto(texto: string): void {
    const arrayActual = this.formGroup.get('titulos')?.value;
    arrayActual.push(texto);
    this.formGroup.get('titulos')?.setValue(arrayActual);

    this.formGroup.get('flagTitulo')?.reset();
  }

  get arrayTitulos() : string[] {  
    return this.formGroup.get('titulos')?.value;
  }

  eliminarTitulo(index: number): void { 
    const arrayActual = this.formGroup.get('titulos')?.value;
    arrayActual.splice(index, 1);
    this.formGroup.get('titulos')?.setValue(arrayActual);
  }

}
