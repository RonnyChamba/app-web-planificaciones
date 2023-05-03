import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataDetails, DetailsPlanification, PlanificationModel } from '../../models/planification.model';
import { Subscription } from 'rxjs';
import { UtilDetailsService } from '../../services/util-details.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { ReviewService } from '../../services/review.service';
import * as dayjs from 'dayjs';
import { PlanificationService } from '../../services/planification.service';

@Component({
  selector: 'app-detail-planification',
  templateUrl: './detail-planification.component.html',
  styleUrls: ['./detail-planification.component.scss']
})
export class DetailPlanificationComponent implements OnInit, OnDestroy {

  planification: PlanificationModel;

  // Para saber si es para mostrar los detalles de la planificacion o para  subir el archivo de la planificacion
  action: string = "details";


  formGroup: FormGroup;
  statusDisabledButton = true;

  file: File | null = null;
  private subscription: Subscription = new Subscription();
  constructor(
    private utilDetailsService: UtilDetailsService,
    private toaster: ToastrService,
    private reviewService: ReviewService,
    private uploadFileService: UploadFileService,
    private loginService: LoginService,
    private planificationService: PlanificationService,
  ) { }



  ngOnInit(): void {


    this.createForm();

    this.formGroup.get("nameFile")?.disable();

    this.subscription.add(
      this.utilDetailsService.refreshDetailPlanificationAsObservable().subscribe(
        (data: any) => {
          console.log("data recibida", data);

          this.planification = data.planification;
          this.action = data.action;

        }
      )
    );
  }

  createForm() {
    this.formGroup = new FormGroup({
      nameFile: new FormControl(null, [Validators.required]),
      resource: new FormControl("", []),

    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.size > 0) {

      this.file = file;
      if (this.validFile()) {
        this.formGroup.get("nameFile")?.setValue(this.file.name);
        this.statusDisabledButton = false;
      }

    } else alert("No se ha seleccionado ningún archivo");
  }

  cancel() {
    this.formGroup.reset();
    this.statusDisabledButton = true;
    this.file = null;
  }

  async uploadFile() {

    // console.log("uploadFile", this.file);
    // console.log("uploadFile", this.file?.name);


    if (this.file && this.file?.size > 0) {

      if (this.validFile()) {


        try {
          // retorna la información del archivo subido name,  type, url, 
          const resource = await this.uploadFileService.uploadFile(this.file);

          const user = await this.loginService.getUserCurrent();

          const dateCurrent = dayjs().format('YYYY-MM-DD HH:mm:ss');
          const detailsPlanification: DetailsPlanification = {

            dateCreated: dateCurrent,
            observation: "",
            planification: this.planification.uid,
            status: false,
            resource: resource,
            teacher: {
              uid: user?.uid,
              fullName: user?.displayName,
              email: user?.email,
            }
          }


          const respose = await this.reviewService.saveDetailsPlanification(detailsPlanification);

          const  detailPlani: DataDetails  = {
            details_uid: respose.id,
            teacher_uid: user?.uid!
          }

          await this.planificationService.updateDetailsPlanification(this.planification.uid as string, detailPlani );
          

          // actualiza la planificación con el detalle de la planificación

          console.log("respose detalle", respose); 

          this.toaster.success("Planificación subida correctamente");
        } catch (error) {
          // console.log("error", error);
          this.toaster.error("Error al subir la planificación");
        }


      }
    } else alert("No se ha seleccionado ningún archivo");




  }

  private validFile(): boolean {

    const name = this.file?.name;
    const extension = name?.split('.').pop();
    const extensionValid = ['pdf', 'doc', 'docx'];

    if (!extensionValid.includes(extension!)) {
      this.cancel();
      this.toaster.warning("El archivo seleccionado no es valido");
      return false;
    }

    return true;
  }


}
