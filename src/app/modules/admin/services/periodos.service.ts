import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';

const COLLECTION_NAME = 'periodos';
@Injectable({
  providedIn: 'root'
})
export class PeriodosService  implements OnInit{

  constructor(private afs: AngularFirestore) { }

  ngOnInit(): void {
  }
  
  findAllPeriodos(): any {
    // snapshotChanges EMIte un evento cada vez que hay un cambio en la base de datos, HAY QUE TENER CUIDADO CON ESTO Y HACER UNSUBSCRIBE
    return this.afs.collection(COLLECTION_NAME).snapshotChanges();
  }

  // quiero listar los periodos que estan activos, es decir que el campo status sea true
  findAllPeriodosActivos(): any {
    return this.afs.collection(COLLECTION_NAME, ref => ref.where('status', '==', true)
    .orderBy('timestamp', 'desc'))
    .snapshotChanges();
  }

  getPeriodo(id: string): any {
    return this.afs.collection(COLLECTION_NAME).doc(id).valueChanges();
  }

  savePeriodo(periodo: any): any {
    return this.afs.collection(COLLECTION_NAME).add(periodo);
  }

  updatePeriodo(id: string, periodo: any): any {
    return this.afs.collection(COLLECTION_NAME).doc(id).update(periodo);
  }

  // eliminacion logica del registro cambiando el valor a falso del campo status
  deletePeriodo(id: string): any {
    return this.afs.collection(COLLECTION_NAME).doc(id).update({ status: false });
  }

  // actualiza se determine que el periodo es el actual, se actualice el campo current a true
  // y los demas periodos que no son el actual se actualicen a false

  updateCurrentPeriodo(id: string): any {
    
    this.afs.collection(COLLECTION_NAME).doc(id).update({ current: true });

    // Obtener todos los documentos
  this.afs.collection(COLLECTION_NAME).snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      return { id };
    }))
  ).subscribe(documents => {
    // Recorrer los documentos y actualizar el campo "current" a false excepto para el documento seleccionado
    documents.forEach(document => {
      if (document.id !== id) {
        this.afs.collection(COLLECTION_NAME).doc(document.id).update({ current: false });
      }
    });
  });

  }




}
