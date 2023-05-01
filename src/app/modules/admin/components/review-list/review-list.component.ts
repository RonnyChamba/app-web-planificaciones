import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Subscription, catchError, of, tap } from 'rxjs';
import { DetailsPlanification, PlanificationModel } from '../../models/planification.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewNoteComponent } from '../review-note/review-note.component';
import { UtilDetailsService } from '../../services/util-details.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit, OnDestroy {


  @Input() planificationModel: PlanificationModel;


  listDetailsPlanification: DetailsPlanification[] = [];
  private subcription = new Subscription();

  constructor(

    private reviewService: ReviewService,
    private modal: NgbModal,
    private utilDetailsService: UtilDetailsService,
    private toaster: ToastrService
  ) { }

  ngOnInit() {
    this.getDetailsPlanification();

    this.addSubscription();
  }

  ngOnDestroy(): void {

    this.subcription.unsubscribe();
  }


  private addSubscription() {

    this.subcription.add(


      this.utilDetailsService.refreshDataReview.subscribe(
        (res: any) => {
          // console.log(res);
          if (res) {

            this.updateObservation(res);
          }

        }


      ));
  }


  private updateObservation(data: any) {


    this.reviewService.findDetailsPlaniByUid(data.detailsPlani)
      .pipe(

        tap(details => {
          if (details.exists) {

            const itemDetails = details.data() as DetailsPlanification;
            itemDetails.uid = details.id;

            // console.log(itemDetails);

            // Buscamos el indice del item que se actualizo
            const foundIndex = this.listDetailsPlanification.findIndex(item => item.uid === itemDetails.uid);

            // Si se encontro el indice se actualiza el item
            if (foundIndex !== -1) {
              // se actualiza el item
              this.listDetailsPlanification[foundIndex] = itemDetails;

            }

          } else this.toaster.error('No se encontro el detalle de la planificación', 'Error');
        }
        ),
        catchError(error => of(`Error : ${error}`))

      ).subscribe();

  }
  getDetailsPlanification() {

    this.reviewService.findDetailsPlanificationByUid(this.planificationModel.uid as string)
      .pipe(

        tap(details => {

          // console.log(details)
          // console.log(details.empty)
          // console.log(details.docs)

          if (details.empty) {
            // console.log('No matching documents.');
            return;
          }

          details.forEach(doc => {

            const data = doc.data() as DetailsPlanification;
            data.uid = doc.id;
            // const id = doc.id;

            // console.log(doc.id, '=>', doc.data());
            // console.log(data);
            // console.log(id);

            this.listDetailsPlanification.push(data);

          })

        }),
        catchError(error => of(`Error : ${error}`))

      ).subscribe();
  }



  openObservation(itemDetails: any) {

    const ref = this.modal.open(ReviewNoteComponent, { size: 'md' });

    // Pasamos los datos al componente hijo para que los muestre en el formulario de edición de la observación
    ref.componentInstance.note = {

      uidPlani: itemDetails.uid, // uid del detalle de la planificación
      title: this.planificationModel.title, // titulo de la planificación
      observation: itemDetails.observation // observación del detalle de la planificación, si esque tiene lo muestra en el formulario

    }
  }

}
