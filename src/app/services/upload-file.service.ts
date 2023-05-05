import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';


const PATH_FILES = 'files';
@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  constructor(
    private storage: AngularFireStorage
  ) { }


  async  uploadFile(file: File): Promise<any> {
  
    
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

  extractFileExtension(filename: string): string {

    return filename.split('.').pop() || '';
  }

  async dowloadFile(resource: any) {

    console.log(resource);

    try {
      const response = await fetch(resource.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('target', "_blank");
      link.download = `${resource.name}`;
      link.click();
      return Promise.resolve(true);
    } catch (error) {
      console.log('Error al descargar el archivo:', error);
      return Promise.reject(error);
    }


  }

  deleteFile(url: any) {

    const filePath = `myfiles/${url}`;
    const fileRef = this.storage.ref(filePath);
    return  fileRef.delete();
  
  }

}
