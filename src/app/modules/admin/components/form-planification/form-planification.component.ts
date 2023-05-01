import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { PlanificationService } from '../../services/planification.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';;
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WeekModelBase } from '../../models/week.model';
import * as dayjs from 'dayjs';
import { UtilDetailsService } from '../../services/util-details.service';
import { typeResource } from '../../models/planification.model';


@Component({
  selector: 'app-form-planification',
  templateUrl: './form-planification.component.html',
  styleUrls: ['./form-planification.component.scss']
})
export class FormPlanificationComponent implements OnInit {


  formGroup: FormGroup;

  // La semana que se va a asignar la planificación, toda planificación debe estar asociada a una semana
  @Input() weekModel: WeekModelBase


  // @Input() idWeeks: string = "9OKIfcODRrpHZKV8KYxm";
  mensajesValidacion = validMessagesError;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;


  files: File[] = [];
  constructor(
    private planiService: PlanificationService,
    private toastr: ToastrService,
    public modal: NgbActiveModal,
    private utilDetailsService: UtilDetailsService,
    private storage: AngularFireStorage) { }

  ngOnInit() {
    this.createForm();

  }

  createForm() {
    this.formGroup = new FormGroup({

      week: new FormControl(this.weekModel.uid, []),
      dateCreated: new FormControl(null, []),
      status: new FormControl("true", []),
      deleted: new FormControl(false, []),
      title: new FormControl(null, [Validators.required]),
      details: new FormControl(null, [Validators.maxLength(200)]),
      timestamp: new FormControl(null, []),
      resource: new FormControl([], []),

    });
  }



  // función para seleccionar un archivo
  onFileSelected(event: any) {

      const file= event.target.files[0];

      console.log(file)
      if (file && file.size > 0) {

        const extension = this.extractFileExtension(file.name);

        if (this.validFileType(extension)) {

          this.files.push(file as File);
          this.formGroup.get('resource')?.reset();

        } else {
          this.toastr.error('El archivo seleccionado no es válido', 'Error');
        }
      }else console.log('no hay archivo')


    // console.log(event)

    // const files: FileList = event.target.files;

    // console.log(files)

    // // valid file size not empty
    // for (let i = 0; i < files.length; i++) {
    //   const file = files.item(i);

    //   console.log(file?.name)
    //   console.log(file?.type)

    //   // valid file size not empty
    //   if (file && file.size > 0) {
        
    //     // valid file type

    //     this.files.push(file as File);
    //   }
    // }
  }


  extractFileExtension(filename: string): string {

    return filename.split('.').pop() || '';
  }


  // función para validar el tipo de archivo
  validFileType(extension: string): boolean {
    
    return  ['pdf', 'doc', 'docx'].includes(extension);

  }

  // función para subir un archivo
  onUpload(): Promise<typeResource[]> {



    const promises = this.files.map(file => this.uploadFile(file));

    return Promise.all(promises);
  }

  async uploadFile(file: File): Promise<typeResource> {

    const filePath = `myfiles/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes

    this.uploadPercent = task.percentageChanges() as Observable<number>;

    return new Promise((resolve, reject) => {

      // obtiene la url de descarga
      task.snapshotChanges().subscribe(
        (snapshot) => {
          // Manejar los cambios del estado de la subida
          if (snapshot?.state === 'success') {
            // Obtener la referencia del archivo subido
            fileRef.getDownloadURL().subscribe((url) => {


              console.log(`File uploaded successfully: ${url}`);

              // Retorno la infomación del archivo subido para guardar en la base de datos
              const resource = { name: file.name, type: this.extractFileExtension(file.name) , url };

              resolve( resource);
            });
          }
        },
        (error) => {
          console.error(`Error uploading file ${file.name}: ${error.message}`);
          reject(error);
        }
      );


    });

  }

  async onSubmit() {

    console.log(this.files);

    // show loader by upload files
    // this.loading = true;


    const resources = await this.onUpload();

    console.log(resources);


    if (resources) this.formGroup.value.resource = resources;

    const dateCurrent = dayjs().format('YYYY-MM-DD HH:mm:ss');

    this.formGroup.value.dateCreated = dateCurrent

    this.formGroup.value.status = this.formGroup.value.status === "true" ? true : false;

    this.formGroup.value.timestamp = Date.now();


    // this.formGroup.value.weeeks =  this.weekModel.uid;

    console.log(this.formGroup.value);

    // validate form before submit

    if (this.formGroup.valid) {

      try {


        // return;
        const resp = await this.planiService.savePlanification(this.formGroup.value);
        this.toastr.success('Planificación creada correctamente', 'Planificación');
        this.modal.close('ok');
        this.formGroup.reset();
        this.files = [];

        // Emitir un evento para refrescar la lista de planificaciones del trimestre
        this.utilDetailsService.refreshDataPlanification.next();

      } catch (error) {
        this.toastr.error('Error al crear la planificación', 'Planificación');


      }
    } else {
      this.toastr.error('Formulario no válido', 'Planificación');
    }


  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }


}
