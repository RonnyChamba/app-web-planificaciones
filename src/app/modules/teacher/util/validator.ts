import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { typeFilterField } from 'src/app/util/types';
import { RegisterService } from '../services/register.service';



/**
 * 
 * @param registerService : Servicio para consultas http
 * @param type : EMAIL | DNI | NAME
 * @param ide : Determinar si la busqueda  se realiza sobre todos los elementos o sobre todos pero exento el registro
 * que tenga el ide
 * @returns 
 */
// authService se pasa como parámetro al async validator
export function dniOrEmailValidator(
    registerService: RegisterService,
    type: typeFilterField,
    ide?: number
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        let field = control.value as string;

        // type input or field y ademas solo si el usuario interactua con el control se realizen las validaciones
        if (field && (control.touched || control.dirty)) {
            if (type == 'DNI' && field.length == 10) {

                return registerService.findTeacher(field)
                    .pipe(
                        map((value) => value ? { fieldExists: 'Cédula ya esta registrada' } : null)
                    );

            }

            if (type == 'EMAIL' && field.length >= 6) {

                return registerService.findTeacherByEmail(field)
                    .pipe(
                        map((value) => !value.empty ? { fieldExists: 'Email ya esta registrado' } : null


                        )
                    );

            }
        }
        // Devuelve un Observable que emite el valor null
        return of(null);

    };
}