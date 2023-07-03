import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { PlanificationService } from '../../services/planification.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, of, tap } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as dayjs from 'dayjs';
import { UtilDetailsService } from '../../services/util-details.service';
import { typeResource } from '../../models/planification.model';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { ReportService } from '../../services/report.service';


@Component({
  selector: 'app-form-planification',
  templateUrl: './form-planification.component.html',
  styleUrls: ['./form-planification.component.scss']
})
export class FormPlanificationComponent implements OnInit {


  formGroup: FormGroup;

  // La semana que se va a asignar la planificación, toda planificación debe estar asociada a una semana
  // @Input() weekModels: WeekModelBase

  // recibe la data del componente padre, se llama tanto para editar como para una nueva planificación
  // la informacion varia dependiendo de la acción que se realice
  @Input() dataInput: any;

  mensajesValidacion = validMessagesError;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;


  files: File[] = [];
  asyncronico: boolean = false;
  constructor(
    private planiService: PlanificationService,
    private toastr: ToastrService,
    public modal: NgbActiveModal,
    private uploadFileService: UploadFileService,
    private tokenService: TokenService,
    private reportService: ReportService,
    private utilDetailsService: UtilDetailsService) { }

  ngOnInit() {
    this.createForm();
    this.setDataForm();

  }

  createForm() {
    this.formGroup = new FormGroup({

      week: new FormControl(this.dataInput.data.uid, []),
      dateCreated: new FormControl(null, []),
      status: new FormControl("true", []),
      deleted: new FormControl(false, []),
      title: new FormControl(null, [Validators.required]),
      details: new FormControl(null, [Validators.maxLength(200)]),
      timestamp: new FormControl(null, []),
      resource: new FormControl([], []),

    });
  }

  async setDataForm() {

    if (this.dataInput.action == 'EDIT') {

      this.formGroup.patchValue({
        title: this.dataInput.data.title,
        details: this.dataInput.data.details,

        // // estos campos se llenan automaticamente, sin embargo cuando es una edición se debe mantener el valor actual,
        // // pero no som tomando en cuenta, pero asigno el valor para que forulario no sea invalido
        // status: this.dataInput.data.status ? "true" : "false",
        // timestamp: this.dataInput.data.timestamp,
        // dateCreated: this.dataInput.data.dateCreated,

      });


      if (this.dataInput.data.resource) {

        const resources = this.dataInput.data.resource;


        for (let index = 0; index < resources.length; index++) {
          const response = await fetch(resources[index].url);

          const blobData = await response.blob();
          const file = new File([blobData], resources[index].name, { type: blobData.type, lastModified: Date.now() });
          this.files.push(file);
        }
        this.asyncronico = true;

      }


      console.log(this.dataInput.data);

    } else this.asyncronico = true;
    console.log(this.dataInput);
  }


  // función para seleccionar un archivo
  onFileSelected(event: any) {

    const file = event.target.files[0];

    console.log(file)
    if (file && file.size > 0) {

      const extension = this.extractFileExtension(file.name);

      if (this.validFileType(extension)) {

        this.files.push(file as File);
        this.formGroup.get('resource')?.reset();

      } else {
        this.toastr.error('El archivo seleccionado no es válido', 'Error');
      }
    } else console.log('no hay archivo')
  }


  extractFileExtension(filename: string): string {

    return filename.split('.').pop() || '';
  }


  // función para validar el tipo de archivo
  validFileType(extension: string): boolean {

    return ['pdf', 'doc', 'docx'].includes(extension);

  }

  // función para subir un archivo
  onUpload(): Promise<typeResource[]> {



    const promises = this.files.map(file => this.uploadFileService.uploadFile(file));

    return Promise.all(promises);
  }


  async onSubmit() {

    if (this.dataInput.action == 'EDIT') {
      this.deleteWhenEdit();
    }
    const resources = await this.onUpload();
    if (resources) this.formGroup.value.resource = resources;

    const dateCurrent = dayjs().format('YYYY-MM-DD HH:mm:ss');
    this.formGroup.value.dateCreated = dateCurrent
    this.formGroup.value.timestamp = Date.now();
    this.formGroup.value.status = this.formGroup.value.status === "true" ? true : false;
    if (this.formGroup.valid) {

      try {

        if(this.dataInput.action == 'EDIT'){
         await this.updatePlanification();
          return;
        } 
        const resp = await this.planiService.savePlanification(this.formGroup.value);

        
        // estrez los datos de larespuesta
        this.toastr.success('Planificación creada correctamente', 'Planificación');
        this.modal.close('ok');
        this.formGroup.reset();
        this.files = [];

  
        console.log("resp");
         

        const data = await resp.get();

        const obj = data.data() as any;
        obj.uid = data.id;
  
        this.registerDataReport( obj);

        // Emitir un evento para refrescar la lista de planificaciones del trimestre
        this.utilDetailsService.refreshDataPlanification.next();

      } catch (error) {
        console.log(error);
        this.toastr.error('Error al crear la planificación', 'Planificación');

      }
    } else {
      this.toastr.error('Formulario no válido', 'Planificación');
    }

  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteWhenEdit() {

    console.log(this.dataInput.data.resource ? true : false);

    // Indica que la planificación si tiene recursos actualmente, por se debe validar para ver si quitar el recurso de la lista de recursos
    if (this.dataInput.data.resource && this.dataInput.data.resource.length > 0) {


      // Obtenemos los nombres de los recursos que tiene actualmente la planificación
      const namesCurrentFile = this.dataInput.data.resource.map((item: any) => item.name);


      namesCurrentFile.forEach((url: string) => {


        this.uploadFileService.deleteFile(url).pipe(

          tap((resp) => {
            console.log(resp);
          })
          , catchError((error) => {
            console.log(error);
            return of(null);
          })
        ).subscribe();



      });

    } else {

      // indica que no tiene recursos actualmente, por lo tanto se debe quitar el recurso de la lista de recursos
    }

  }

  async updatePlanification() {


    try {

      // return;
    
      const resp = await this.planiService.updatePlanification( this.dataInput.data.uid, this.formGroup.value);
      this.toastr.info('Planificación actualizada correctamente');

      const valueForm = this.formGroup.value;
      this.modal.close('ok');
      this.formGroup.reset();
      this.files = [];

      // actualizar el registro de reporte de la planificación

      this.reportService.findDataReportByUidPlanificacion(this.dataInput.data.uid).subscribe((resp) => {

        console.log("resp");
        console.log(resp); 

        if (resp.docs.length > 0) {

          const data = resp.docs[0].data() as any;

          data.uid = resp.docs[0].id;

          /**
           * Actualizar el reporte de la planificación el titulo y los detalles
           */
          this.reportService.updateFieldReport(data.uid, valueForm).then((resp) => {

            console.log("se actualizo el reporte");
            console.log(resp);
          }
          ).catch((error) => {
            this.toastr.warning('Error al actualizar el reporte para la planificación', 'Reporte');
            console.log("error al actualizar el reporte");
            console.log(error);
          }
          );
        }

      });





      // Emitir un evento para refrescar la lista de planificaciones del trimestre
      this.utilDetailsService.refreshDataPlanification.next();

    } catch (error) {
      console.log(error);
      this.toastr.error('Error al actualizar planificación', 'Planificación');


    }
 
  }


  /**
   * Cada vez que crear una nueva planificacion se debe crear un registro en la tabla de reportes,
   * esto para poder generar el reporte de la planificación con mas facilidad sin tener que hacer un join 
   * con la tabla de planificaciones
   * @param planificacionSaved 
   */
  private registerDataReport(planificacionSaved: any){

    console.log("planificacionSaved creando el reporte");
    console.log(planificacionSaved);

    const periodo =   JSON.parse(this.tokenService.getCurrentPeriodo() || '{}');
    console.log(periodo);
    const course = JSON.parse(this.tokenService.getCourse() || '{}');

    console.log(course);
    const dataReport = {

      uidPeriodo: periodo?.id,
      descriptionPerido: periodo?.title,
      uidCurso: course?.uid,
      descriptionCurso: course?.name,
      uidPlanification: planificacionSaved?.uid,
      descriptionPlanification: planificacionSaved?.details,
      titlePlanification: planificacionSaved?.title,
      uidTrimestre: this.dataInput.data.uid,
      descriptionTrimestre: this.dataInput.data.title,
      statusDeleted: false,
      dateCreated: planificacionSaved?.dateCreated,
      dateCreatedTimestamp: planificacionSaved?.timestamp,
      details_planification: []
  }
  console.log("dataReport a insertar");
  console.log(dataReport);


  this.reportService.saveDataReport(dataReport).then((resp) => {

    console.log("se guardo el reporte");
    console.log(resp);
  }
  ).catch((error) => {
    this.toastr.warning('Error al guardar el reporte para la planificación', 'Reporte');
    console.log("error al guardar el reporte");
    console.log(error);
  }
  );





}

}
