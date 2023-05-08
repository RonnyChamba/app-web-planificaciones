import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';
import { DetailsPlanification } from 'src/app/modules/admin/models/planification.model';
import { ReviewService } from 'src/app/modules/admin/services/review.service';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss']
})
export class ViewDetailComponent implements OnInit {


  // Recibe el uid de detalle de planificacion para mostrar los detalles
  @Input() uidDetailsPlani: any;

  detailsPlanification: DetailsPlanification
  constructor(
    private reviewService: ReviewService,
    public modal: NgbActiveModal,
    private toaster: ToastrService

  ) { }

  ngOnInit(): void {
    this.getDetailsPlanification();




  }

  private getDetailsPlanification() {

    this.reviewService.findDetailsPlaniByUid(this.uidDetailsPlani)

      .pipe(
        tap((resp: any) => {

          if (!resp.exists) {
            this.toaster.error('No se encontró la planificación', 'Error');
            this.modal.close();
            // return of(null);
          } else {
            const data = resp.data();
            this.detailsPlanification = data;
          }




        }
        ),
        catchError((err) => {
          console.log(err);

          this.toaster.error('Error al obtener los detalles de la planificación', 'Error');
          this.modal.close();
          return of(null);
        }
        ))
      .subscribe();


  }


}
