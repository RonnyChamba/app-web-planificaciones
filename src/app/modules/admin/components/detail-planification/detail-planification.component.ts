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
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { ReportService } from '../../services/report.service';

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
    private messageService: MensajesServiceService,
    private reportService: ReportService
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

    if (this.file && this.file?.size > 0) {

      if (this.validFile()) {

        try {

          this.messageService.loading(true, "Subiendo planificación ...");
          // retorna la información del archivo subido name,  type, url, 
          const resource = await this.uploadFileService.uploadFile(this.file);
          const user = await this.loginService.getUserCurrent();

          const dateTime = Date.now();

          const dateCurrent = dayjs().format('YYYY-MM-DD HH:mm:ss');

          /**
           * Si a la planificacion actual ya se le ah subido un archivos, entonces ahora hay que actualizar el campo items en 
           * uno de los documntos de la tabla details_planification
           * 
           * Pasos: 
           * 1) obtener el usuario actual
           * 2) obtener el campo details_planification de la planificacion actual, este campo es un arreglo  de objetos con 3 campos
           *     details_uid: corresponde al uid del documento de la tabla details_planification
                 teacher_uid: corresponde al uid del teacher que subio el archivo
                 status: corresponde al estado general del detalle de la planificación
           * 
           * 3) De ese arreglo, obtener el objeto que corresponde al usuario actual, es decir, el objeto que tiene el campo teacher_uid 
           *   igual al uid del usuario actual
           * 
           * 4) Si el objeto existe, entonces agregar una nuevo item al campo items de la coleccion details_planification
           * 5) En caso que no existe el objeto, entonces crear un nuevo objeto con los campos details_uid, teacher_uid, status(hacer lo mismo que en el bloque else)
           * 
           */

          // averigua si la planificacion actual ya tiene una details_planification subido por cualquier teacher
          let isNew = (this.planification?.details_planification
            &&
            this.planification?.details_planification.length > 0);

          if (isNew) {

            // averigua si el usuario actual ya subio un archivo en la planificacion actual
            isNew = this.planification?.details_planification?.some((item: DataDetails) => item.teacher_uid == user?.uid);
          }

          if (isNew) {
            // obtener del arreglo details_planification el objeto que corresponde al usuario actual, es decir, el objeto que tiene el campo teacher_uid
            // igual al uid del usuario actual
            const dataDetails = this.planification?.details_planification?.find((item: DataDetails) => item.teacher_uid == user?.uid);

            console.log("dataDetails", dataDetails);

            // nuevo item del campo items de una details_planification
            const newItem =
            {
              // este representara el id del item, nos servira cuando deseemos actualiza  datos del item
              dateCreated: dayjs().add(2, 'second').valueOf(),
              dateUpload: dateCurrent,
              observation: "",
              status: false, // siempre se crea en false
              ...resource // tiene 3 campos name, type, url
            }
               await this.reviewService.updateItemsDetailsPlanification({
                uid: dataDetails?.details_uid,
                operation: 'add',
                data: newItem,

                  // esto me sirve para actualizar en el campo details_planification del reporte, no se crea uno nuevo, se actualizar 
                  // el countUpload nada maz, sin embargo paso el uid_teacher para saber que tiene se debe actualizar 
                itemReport :  {
                  dateCreated: dateCurrent,
                  dateCreatedTime: dateTime,
                  fullName: user?.displayName,
                  status: false,
                  uid_teacher: user?.uid,
                }
                
              
              
               });

            // cuando es la primera vez que cualquier teacher sube un archivo, el campo details_planification esta como  arreglo vacio o no existe
          } else {
            const detailsPlanification: DetailsPlanification = {
              dateCreated: dateCurrent,
              observation: "",
              planification: this.planification.uid,
              status: false,
              items: [
                {
                  // este representara el id del item, nos servira cuando deseemos actualiza  datos del item
                  dateCreated: dayjs().add(2, 'second').valueOf(),
                  dateUpload: dateCurrent,
                  observation: "",
                  status: false, // siempre se crea en false
                  ...resource // tiene 3 campos name, type, url
                }

              ],
              // este campo es opcional, antes lo usaba para guardar el archivo, pero ahora se guarda en el campo items
              resource: resource,
              teacher: {
                uid: user?.uid,
                fullName: user?.displayName,
                email: user?.email,
              }
            }
            const respose = await this.reviewService.saveDetailsPlanification(detailsPlanification);

            // actualiza la tabla planificación  el campo detalle de la planificación
            const detailPlani: DataDetails = {
              details_uid: respose.id,
              teacher_uid: user?.uid!,
              status: false, // siempre se crea en false
            }
            await this.planificationService.updateDetailsPlanification(this.planification.uid as string, detailPlani);

            console.log("respose detalle", respose);

            // --------------------- CREAR EN REPORTE ------------------------------

            this.reportService.findDataReportByUidPlanificacion(this.planification.uid  || "").subscribe((resp) => {

              console.log("resp");
              console.log(resp); 
      
              if (resp.docs.length > 0) {
      
                const data = resp.docs[0].data() as any;

                data.uid = resp.docs[0].id;
                
                // item del campo details_planificación de un documento en reporte
                const  newItemDetailsPlanification = {
                  countUpload: "1",
                  dateCreated: dateCurrent,
                  dateCreatedTime: dateTime,
                  fullName: user?.displayName,
                  status: false,
                  uid_teacher: user?.uid,
                }


                this.reportService.updateDetailsPlanificationReporte(data.uid, newItemDetailsPlanification).then((resp) => {

                  console.log("resp updateDetailsPlanificationReporte", resp);
                  
                }
                ).catch((error) => {
                  console.log("error updateDetailsPlanificationReporte", error);
                  
                }
                );



              }
      
            });

          
            // ------------------------------- FIN CREAR EN REPORTE ----------------------------

          }


          // agregar un nuevo item en la tabla reportes correspondiente a la planificacion actuaal, en unos de los dcumentos de la tabla reportes
          // busca el documetno donde el uidPLanification sea igual al uid de la planificacion actual





          
          this.messageService.loading(false);
          this.toaster.success("Planificación subida correctamente");

        } catch (error) {
          // console.log("error", error);
          this.messageService.loading(false);
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
