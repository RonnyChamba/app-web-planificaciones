import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ReportService } from './report.service';

const COLLECTION_NAME = 'details_planification';

@Injectable({
  providedIn: 'root'
})
export class ReviewService implements OnInit {


  constructor(private afs: AngularFirestore,
    private reporteService: ReportService) { }

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

  findDetailsPlaniByUidSnap(uid: string) {

    return this.afs.collection(COLLECTION_NAME).doc(uid).snapshotChanges();
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


  /**
   * 
   * @param request  un objeto con la data a actualizar o guardar
   * @returns 
   */
  async updateItemsDetailsPlanification(
    request: any) {
    // return;
    try {
      const planiDocRef = this.afs.collection(COLLECTION_NAME).doc(request.uid);
      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {

        const userDoc = await transaction.get(planiDocRef.ref);
        console.log(userDoc);

        // Obtener el arreglo actual, se pasa el campo a leer 
        const items = userDoc.get('items') || [];

        // Obtener el campo planificacion
        const uidPlanification = userDoc.get('planification') || null;

        console.log("uidPlanification transaction", uidPlanification);

        // Determinar si se va a agregar un nuevo item o actualizar un item existente

        if (request.operation == 'add') {
          // Agregar el nuevo elemento al arreglo
          items.push(request.data);

        } else {
          // obtener el indice del elemento a actualizar, la fecha son unicos, corresposden al momento en que 
          // se creo el item en la base de datos, por lo tanto se puede usar para identificar el item a actualizar
          const index = items.findIndex((item: any) => item.dateCreated == request.seconds);

          // si el indice es diferente a -1, es porque el item existe en el arreglo
          if (index !== -1) {
            // actualizar el item en el arreglo, solo se actualiza la observacion y el status
            items[index].observation = request.data.observation;
            items[index].status = request.data.status;
          }
        }

        const numeroItems = items.length || 0;

        //  const items = userDoc.data()?.details_planification || [];

        // Agregar el nuevo elemento al arreglo
        // items.push(newItem);

        // Actualizar el documento con el nuevo arreglo
        transaction.update(planiDocRef.ref, { items });


        // actualizar en la collection reportes


        // obtener el documento que se encuentra en la collection reportes que tiene el campo planification igual al uid de la planificacion

      
        this.reporteService.findDataReportByUidPlanificacion(uidPlanification  || "").subscribe((resp) => {

          console.log("resp");
          console.log(resp); 
  
          if (resp.docs.length > 0) {
  
            const data = resp.docs[0].data() as any;

            data.uid = resp.docs[0].id;

            

            request.itemReport.countUpload = numeroItems;
            request.itemReport.status = request.data.status;

            this.reporteService.updateDetailsPlanificationStatusCountUploadReport(data.uid, request).then((resp) => {

              console.log("resp updateDetailsPlanificationReporte", resp);
              
            }
            ).catch((error) => {
              console.log("error updateDetailsPlanificationReporte", error);
              
            }
            );



          }
  
        });


        // ------------------------------ ----------------------------

      })
      return Promise.resolve(true);

    } catch (error) {
      return Promise.reject(error);

    }
  }
}
