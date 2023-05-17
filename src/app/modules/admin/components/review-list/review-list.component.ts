import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Subscription, catchError, of, tap } from 'rxjs';
import { DetailsPlanification, PlanificationModel } from '../../models/planification.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewNoteComponent } from '../review-note/review-note.component';
import { UtilDetailsService } from '../../services/util-details.service';
import { ToastrService } from 'ngx-toastr';
import { UploadFileService } from 'src/app/services/upload-file.service';

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
    private uploadFileService: UploadFileService,
    private toaster: ToastrService
  ) { }

  ngOnInit() {
    this.getDetailsPlanification();

    // this.addSubscription();
  }

  ngOnDestroy(): void {



    this.subcription.unsubscribe();
  }
  getDetailsPlanification() {

  this.subcription =     this.reviewService.findDetailsPlanificationByUid(this.planificationModel.uid as string)
      .pipe(

        tap(details => {

          // console.log(details)
          // console.log(details.empty)
          // console.log(details.docs)

          // if (details.empty) {
          //   // console.log('No matching documents.');
          //   return;
          // }

          this.listDetailsPlanification = [];

          details.forEach(doc => {

            const data = doc.payload.doc.data()  as DetailsPlanification;
            data.uid =  doc.payload.doc.id;
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

  async dowloadFile(resource: any) {

    // console.log(resource);

    try {
     
      const resp = await this.uploadFileService.dowloadFile(resource);

    } catch (error) {
    
      this.toaster.error('Error al descargar el archivo');
    }
  }

  async onChangeStatus(  event: any,   itemDetails: any) {
  
    
    const uid = itemDetails.uid;
    const status = event.target.checked;
    // console.log(uid);

    try {
  
       await this.reviewService.updateStatus(uid, status);
       this.toaster.info('Se actualizo el estado correctamente');
    } catch (error) {
      
      this.toaster.error('Error al actualizar el estado');
    }
    
    
  }
}
