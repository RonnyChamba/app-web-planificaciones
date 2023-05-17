import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewService } from '../../services/review.service';
import { ToastrService } from 'ngx-toastr';
import { UtilDetailsService } from '../../services/util-details.service';

@Component({
  selector: 'app-review-note',
  templateUrl: './review-note.component.html',
  styleUrls: ['./review-note.component.scss']
})
export class ReviewNoteComponent  implements OnInit{
  @Input() note: any;
  
  constructor(

    public modal: NgbActiveModal,
    private reviewService: ReviewService,
    private toaster: ToastrService,
    private utilDetailsService: UtilDetailsService
  ) { }

  ngOnInit() {

    // console.log(this.note);
  }

  closeModal() {
    this.modal.dismiss();
  }

  save(value: any) {

    console.log(value);
    this.reviewService.updateObservation(this.note.uidPlani, value)
    .then(() => {

      this.modal.close('Save');
      this.toaster.info('Observación actualizada con éxito');

      // // Ahora se actualiza el unicamente el registro  que fue actualizado en la lista de detalles,
      // this.utilDetailsService.refreshDataReview.next({
      //   type: 'observation', // para indicar que dbe actualizar la observación
      //   detailsPlani: this.note.uidPlani, // el uid del detalle de la planificación que se debe actualizar
      // });
    })
    .catch((error) => {
      this.toaster.error('Error al actualizar la observación');
      // console.log(error);
    })


  }
}
