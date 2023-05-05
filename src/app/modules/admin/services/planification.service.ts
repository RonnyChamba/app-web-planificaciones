import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PlanificationModel } from '../models/planification.model';

const COLLECTION_NAME = 'planifications';

@Injectable({
  providedIn: 'root'
})
export class PlanificationService implements OnInit {

  constructor(private afs: AngularFirestore) { }

  ngOnInit(): void {

  }

  savePlanification(data: PlanificationModel) {

    console.log(data);

    return this.afs.collection(COLLECTION_NAME).add(data);
  }

  findPlanificationByWeeksId(weeksId: string) {
    return this.afs.collection(COLLECTION_NAME, ref => ref.where('week', '==', weeksId).orderBy('timestamp', 'desc')).get();
  }

  getPlanificationById(uid: string) {
    return this.afs.collection(COLLECTION_NAME).doc(uid).get();
  }

  updateDetailsPlaniByPlanification(uid: string, data: any) {
    // return this.afs.collection(COLLECTION_NAME).doc(uid).update({
    //   details_planification: data,
    // });

    return this.afs.collection(COLLECTION_NAME).doc(uid).update({
      details_planification: data,
    });

  }

  /**
   * Aqui se maneja transacciones es una operación atómica, es decir, que se ejecuta en su totalidad o no se ejecuta.
   * @param planIde 
   * @param newItem 
   * @returns 
   */
  async updateDetailsPlanification(planIde: string, newItem: any) {


    try {
      const planiDocRef = this.afs.collection(COLLECTION_NAME).doc(planIde);
      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {

        const userDoc = await transaction.get(planiDocRef.ref);

        // Obtener el arreglo actual, se pasa el campo a leer 
        const items = userDoc.get('details_planification') || [];

        //  const items = userDoc.data()?.details_planification || [];

        // Agregar el nuevo elemento al arreglo
        items.push(newItem);

        // Actualizar el documento con el nuevo arreglo
        transaction.update(planiDocRef.ref, { details_planification: items});


      })
      return Promise.resolve(true);

    } catch (error) {
      return Promise.reject(error);

    }
  }

  updatePlanification(uid: string, data: any) {
    return this.afs.collection(COLLECTION_NAME).doc(uid).update( {

      title: data.title,
      details: data.details,
      resource: data.resource,
    });
  }


}
