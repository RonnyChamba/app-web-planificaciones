import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validMessagesError } from 'src/app/util/mensajes-validacion';
import { PlanificationService } from '../../services/planification.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';;
import { ToastrService } from 'ngx-toastr';
import { Observable, finalize } from 'rxjs';

@Component({
  selector: 'app-form-planification',
  templateUrl: './form-planification.component.html',
  styleUrls: ['./form-planification.component.scss']
})
export class FormPlanificationComponent implements OnInit {


  formGroup: FormGroup;
  @Input() idWeeks: string = "9OKIfcODRrpHZKV8KYxm";
  mensajesValidacion = validMessagesError;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;


  files: File[] = [];


  constructor(private planiService: PlanificationService,
    private toastr: ToastrService,
    private storage: AngularFireStorage) { }

  ngOnInit() {
    this.createForm();

  }

  createForm() {
    this.formGroup = new FormGroup({

      weeeks: new FormControl(null, []),
      dateCreated: new FormControl(null, []),
      status: new FormControl("true", []),
      deleted: new FormControl(false, []),
      title: new FormControl(null, [Validators.required]),
      details: new FormControl(null, [Validators.maxLength(200)]),
      resource: new FormControl(null, []),

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

  private uploadFile(file: File): Promise<string> {  
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

      this.formGroup.value.dateCreated = new Date();
      this.formGroup.value.status = this.formGroup.value.status === "true" ? true : false;
      this.formGroup.value.weeeks =  this.idWeeks;

      console.log(this.formGroup.value);

    // validate form before submit

      if (this.formGroup.valid) {

        try {
          const resp = await this.planiService.savePlanification(this.formGroup.value);
          this.toastr.success('Planificación creada correctamente', 'Planificación');
          this.formGroup.reset();
          this.files = [];

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
