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

  resources: typeResource[] = []
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

    // console.log(event)

    const files: FileList = event.target.files;

    console.log(files)

    // valid file size not empty
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);

      console.log(file?.name)
      console.log(file?.type)

        if (file && file.size > 0) {
          this.files.push(file as File);
        }
    }
  }

  // función para subir un archivo
  onUpload() : Promise<string[]> {



    const promises = this.files.map(file => this.uploadFile(file));

    return Promise.all(promises);
  }

   uploadFile(file: File): Promise<string> {  
    
    const filePath = `myfiles/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    this.resources.push({name: file.name, url: filePath, type: file.type})
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

                resolve(url);
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


     const nameFiles  = await  this.onUpload();
     
     console.log(nameFiles);
  
     
     if (nameFiles)  this.formGroup.value.resource = nameFiles;

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
    }else {
      this.toastr.error('Formulario no válido', 'Planificación');
    }


  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }


}
