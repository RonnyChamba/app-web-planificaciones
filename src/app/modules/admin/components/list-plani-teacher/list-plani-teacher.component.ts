import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewService } from '../../services/review.service';
import { Subscription } from 'rxjs';
import { DetailsPlanification } from '../../models/planification.model';
import { TokenService } from 'src/app/modules/auth/services/token.service';

@Component({
  selector: 'app-list-plani-teacher',
  templateUrl: './list-plani-teacher.component.html',
  styleUrls: ['./list-plani-teacher.component.scss']
})
export class ListPlaniTeacherComponent implements OnInit, OnDestroy {

  planificationsDetails: any;

  // uid del detalle de la planificación a listar
  @Input() uidDetailPlanification: any;
  private subscriptionList: Subscription;

  isAdmin = false;

  constructor(
    private uploadFileService: UploadFileService,
    private toaster: ToastrService,
    public modal: NgbActiveModal,
    private reviewService: ReviewService,
    private tokenService: TokenService
  ) {
    this.isAdmin = this.tokenService.isLoggedAdmin();
  }
  ngOnInit() {
    console.log(this.planificationsDetails);

    console.log(this.uidDetailPlanification);

    this.subscriptionList = this.reviewService.findDetailsPlaniByUidSnap(this.uidDetailPlanification).subscribe((resp: any) => {

      this.planificationsDetails = resp.payload.data() as DetailsPlanification;
      this.planificationsDetails.uid = resp.payload.id;
      console.log(resp.payload.data());

    }
    );

  }

  ngOnDestroy(): void {

    this.subscriptionList.unsubscribe();
  }
  async openObservation(itemDetails: any,
    observation: any) {

  
    // console.log(itemDetails);
    // console.log(this.planificationsDetails);
    

    const request = {
      uid: this.planificationsDetails.uid, // ide de un documento de details_planification
      data: { // data a actualizar o guardar
        observation,
        status: itemDetails.status,
      },
      seconds: itemDetails.dateCreated, // fecha de creación del item de la details_planificación, lo utilizamod para determinar el item que se debe actualizar
      operation: "update",
    }
    // return;

    try {

      await this.reviewService.updateItemsDetailsPlanification(request);
      this.toaster.info('Registro actualizado correctamente');
    } catch (error) {
      console.log(error);
      this.toaster.error('Error al actualizar el registro');
    }
  }

  onChangeStatus(event: any): boolean {
    return event.target.checked;

  }

// ya no se usa
  async dowloadFile(item: any) {
    const resource = {
      name: item.name,
      type: item.type,
      url: item.url
    }
    try {

      const resp = await this.uploadFileService.dowloadFile(resource);

    } catch (error) {

      this.toaster.error('Error al descargar el archivo');
    }
  }





}
