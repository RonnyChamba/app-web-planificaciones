import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Subscription, catchError, of, tap } from 'rxjs';
import { DetailsPlanification, PlanificationModel } from '../../models/planification.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewNoteComponent } from '../review-note/review-note.component';
import { UtilDetailsService } from '../../services/util-details.service';
import { ToastrService } from 'ngx-toastr';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { ListPlaniTeacherComponent } from '../list-plani-teacher/list-plani-teacher.component';
import { PlanificationService } from '../../services/planification.service';
import Swal from 'sweetalert2';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { ReportService } from '../../services/report.service';
import { TokenService } from 'src/app/modules/auth/services/token.service';

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
    private planificationService: PlanificationService,
    private toaster: ToastrService,
    private messageService: MensajesServiceService,
    private reportService: ReportService
  ) { }

  ngOnInit() {

    this.getDetailsPlanification();

    // this.addSubscription();
  }

  ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }
  getDetailsPlanification() {

    this.subcription = this.reviewService.findDetailsPlanificationByUid(this.planificationModel.uid as string)
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

            const data = doc.payload.doc.data() as DetailsPlanification;
            data.uid = doc.payload.doc.id;
            // const id = doc.id;

            // console.log(doc.id, '=>', doc.data());
            // console.log(data);
            // console.log(id);
            console.log(data);

            this.listDetailsPlanification.push(data);
            // console.log(this.listDetailsPlanification);

          })

          // cuando entra al componente padre de este componente(osea la page)  se muestra el mensaje de cargando
          Swal.close();

        }),
        catchError(error => {

          // cuando entra al componente padre de este componente(osea la page)  se muestra el mensaje de cargando
          Swal.close();
          this.toaster.error('Error al cargar los detalles de la planificación');
          return of(`Error : ${error}`)
        }

        )

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
  /**
   * 
   * @param event 
   * @param itemDetails 
   */
  async onChangeStatus(event: any, itemDetails: any) {

    console.log(itemDetails);

    // return;


    this.messageService.loading(true, "Actualizando estado ...");

    // hacer una pausa de medio segundo
     setTimeout( async () => {
   
      try {
        console.log(this.planificationModel);

        const uid = itemDetails.uid;
        const status = event.target.checked;
  
        // actualizar el estado en la tabla details_planificacion
        await this.reviewService.updateStatus(uid, status);
  
        // actualizar el estado en la tabla planification del campo details_planification del item seleccionado
        await this.planificationService.updateStatusDetailsPlanification(this.planificationModel.uid as string, uid, status);

        // actualizar el estado en un  documentode reporte que pertenece a la planificación, buscar el item mediante el uid_teacher_actual

        this.updateStatusPlanificationReport(status, itemDetails);



  
        this.messageService.loading(false);
        this.toaster.info('Se actualizo el estado correctamente');
      } catch (error) {
  
        this.messageService.loading(false);
        this.toaster.error('Error al actualizar el estado');
      }

    }, 500);
  }

  openDetails(itemDetails: any) {

    const ref = this.modal.open(ListPlaniTeacherComponent,
      {
        size: 'xl',
        scrollable: true,
        backdrop: 'static',
        keyboard: false,
      });

    ref.componentInstance.uidDetailPlanification = itemDetails.uid;
  }

  private updateStatusPlanificationReport(status: boolean, itemDetails: any){


    this.reportService.findDataReportByUidPlanificacion(this.planificationModel.uid  || "").subscribe((resp) => {

      console.log("resp");
      console.log(resp); 

      if (resp.docs.length > 0) {

        const data = resp.docs[0].data() as any;

        data.uid = resp.docs[0].id;
      
        const  newStatus = {
          uid_teacher: itemDetails.teacher.uid ||  "",
          status
        }
        this.reportService.updateDetailsPlanificationStatusReport(data.uid, newStatus).then((resp) => {

          console.log("resp updateDetailsPlanificationReporte", resp);
          
        }
        ).catch((error) => {
          console.log("error updateDetailsPlanificationReporte", error);
          
        }
        );



      }

    });




  }
}
