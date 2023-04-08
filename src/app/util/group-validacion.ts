import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";
import { validCedula } from "./valid-cedula";


// metodo validador de cedula de identidad
export function validatorDni(): ValidatorFn {
    return (dni: AbstractControl): ValidationErrors | null => {

        // console.log("dentro de la funcion")
    

      if (dni.value && dni.value.match("^[0-9]{10}$") ) {
        let  {status, message} =  validCedula(dni.value)

        if (!status) {
          return {'incorrectDni' : message }
        }
      }
      
      return null;
    };
  }