import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

const COLLECTION_NAME = 'details_planification';

@Injectable({
  providedIn: 'root'
})
export class ReviewService implements OnInit {


  constructor(private afs: AngularFirestore) { }

  ngOnInit(): void {
  }

  /**
   * Recuperar los detalles de la planificacion por el uid de  una planificacion en especifico
   * @param uid 
   * @returns 
   */
  findDetailsPlanificationByUid(uid: string) {

    return this.afs.collection(COLLECTION_NAME, ref => ref.where('planification', '==', uid)).snapshotChanges();

  }

  updateObservation(uid: string, observation: string) {

    return this.afs.collection(COLLECTION_NAME).doc(uid).update({ observation: observation });
  }

  findDetailsPlaniByUid(uid: string) {

    return this.afs.collection(COLLECTION_NAME).doc(uid).get();
  }

  saveDetailsPlanification(detailsPlanification: any) {

    return this.afs.collection(COLLECTION_NAME).add(detailsPlanification);
  }

  deleteDetailsPlanification(uid: string) {
      
      return this.afs.collection(COLLECTION_NAME).doc(uid).delete();
    }

    updateStatus(uid: string, status: boolean) {

      return this.afs.collection(COLLECTION_NAME).doc(uid).update({ status: status });
    }

}
