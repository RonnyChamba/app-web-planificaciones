import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MensajesServiceService {

  constructor() { }

  public loading(activo: boolean, text?: string) {
    if (activo) {
      Swal.fire({
        title: 'Espere',
        text:  text? text: 'Procesando Información',
        icon: 'info',
        allowOutsideClick: false,
      });
      Swal.showLoading();
    } else {
      Swal.close();
    }
  }
}
