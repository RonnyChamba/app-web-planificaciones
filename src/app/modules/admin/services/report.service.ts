import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CourseModel } from '../models/course.model';

const COLLECTION_NAME_WEEKS = 'weeks';
const COLLECTION_NAME_REPORT = 'reportes';
@Injectable({
  providedIn: 'root',
})
export class ReportService implements OnInit {
  constructor(private afs: AngularFirestore) {}

  ngOnInit(): void {}

  findWeeksByCourseId(courseId: string) {
    // console.log('findWeeksByCourseId', courseId);
    // return this.afs.collection(COLLECTION_NAME, ref => ref.where('course', '==', courseId)).get();
    return this.afs
      .collection(COLLECTION_NAME_WEEKS, (ref) =>
        ref.where('course', '==', courseId).orderBy('timestamp', 'asc')
      )
      .get();
  }

  saveDataReport(data: any) {
    return this.afs.collection(COLLECTION_NAME_REPORT).add(data);
  }

  /**
   * Retorna un documento de  reportes de una planificación
   *
   * @param uidPlanifation recibe el uid de la planificación
   * @param data
   * @returns
   */
  findDataReportByUidPlanificacion(uidPlanifation: string) {
    return this.afs
      .collection(COLLECTION_NAME_REPORT, (ref) =>
        ref.where('uidPlanification', '==', uidPlanifation)
      )
      .get();
  }

  updateFieldReport(uid: string, data: any) {
    return this.afs.collection(COLLECTION_NAME_REPORT).doc(uid).update({
      titlePlanification: data.title,
      descriptionPlanification: data.details,
    });
  }

  /**
   * Aqui se maneja transacciones es una operación atómica, es decir, que se ejecuta en su totalidad o no se ejecuta.
   * @param reporIde
   * @param newItem
   * @returns
   */
  async updateDetailsPlanificationReporte(reporIde: string, newItem: any) {
    try {
      const planiDocRef = this.afs
        .collection(COLLECTION_NAME_REPORT)
        .doc(reporIde);

      // const planiDocRef = this.afs.collection(COLLECTION_NAME_REPORT, ref => ref.where("uidPlanification", "==", planIde)).doc();

      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(planiDocRef.ref);

        // Obtener el arreglo actual, se pasa el campo a leer
        const items = userDoc.get('details_planification') || [];

        //  const items = userDoc.data()?.details_planification || [];

        // Agregar el nuevo elemento al arreglo
        items.push(newItem);

        // Actualizar el documento con el nuevo arreglo
        transaction.update(planiDocRef.ref, { details_planification: items });
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Aqui se maneja transacciones es una operación atómica, es decir, que se ejecuta en su totalidad o no se ejecuta.
   * @param reporIde
   * @param newItem
   * @returns
   */
  async updateDetailsPlanificationStatusCountUploadReport(
    reporIde: string,
    newItem: any
  ) {
    try {
      const planiDocRef = this.afs
        .collection(COLLECTION_NAME_REPORT)
        .doc(reporIde);

      // const planiDocRef = this.afs.collection(COLLECTION_NAME_REPORT, ref => ref.where("uidPlanification", "==", planIde)).doc();

      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(planiDocRef.ref);

        // Obtener el arreglo actual, se pasa el campo a leer
        const items = userDoc.get('details_planification') || [];

        // buscar el index  donde el uid_teacher sea igual al uid del teacher que subio el reporte
        const index = items.findIndex(
          (item: any) => item.uid_teacher == newItem.itemReport.uid_teacher
        );

        // si el indice es diferente a -1, es porque el item existe en el arreglo
        if (index !== -1) {
          // actualizar el item en el arreglo, solo se actualiza la observacion y el status
          items[index].status = newItem.itemReport.status;
          items[index].countUpload = newItem.itemReport.countUpload;
        }

        // Actualizar el documento con el nuevo arreglo
        transaction.update(planiDocRef.ref, { details_planification: items });

        console.log(
          'transaction updateDetailsPlanificationStatusCountUploadReport',
          items
        );
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Aqui se maneja transacciones es una operación atómica, es decir, que se ejecuta en su totalidad o no se ejecuta.
   * @param reporIde
   * @param data
   * @returns
   */
  async updateDetailsPlanificationStatusReport(reporIde: string, data: any) {
    try {
      const planiDocRef = this.afs
        .collection(COLLECTION_NAME_REPORT)
        .doc(reporIde);

      // const planiDocRef = this.afs.collection(COLLECTION_NAME_REPORT, ref => ref.where("uidPlanification", "==", planIde)).doc();

      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(planiDocRef.ref);

        // Obtener el arreglo actual, se pasa el campo a leer
        const items = userDoc.get('details_planification') || [];

        // buscar el index  donde el uid_teacher sea igual al uid del teacher que subio el reporte
        const index = items.findIndex(
          (item: any) => item.uid_teacher == data.uid_teacher
        );

        // si el indice es diferente a -1, es porque el item existe en el arreglo
        if (index !== -1) {
          // actualizar el item en el arreglo, solo se actualiza el status
          items[index].status = data.status;
        }

        // Actualizar el documento con el nuevo arreglo
        transaction.update(planiDocRef.ref, { details_planification: items });

        console.log(
          'transaction updateDetailsPlanificationStatusCountUploadReport',
          items
        );
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  findAllReportByPeriodo(periodoId: string) {
    return this.afs
      .collection(COLLECTION_NAME_REPORT, (ref) =>
        ref.where('uidPeriodo', '==', periodoId)
      )
      .get();
  }

  /**
   * Este methodo actualiza el nombre del curso en los reportes, cuando se actualiza un curso, tambien se actualiza en los reportes
   * @param uidCourse
   * @param data
   * @returns
   */

  async updateNameCourse(uidCourse: string, data: CourseModel) {
    try {
      // const reporteDocRef = this.afs.collection("reportes").doc(uidCourse);
      const reporteDocRef = this.afs.collection('reportes').ref;
      // const planiDocRef = this.afs.collection(COLLECTION_NAME_REPORT, ref => ref.where("uidPlanification", "==", planIde)).doc();

      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {
        // const userDoc = await transaction.get(reporteDocRef.where("uidCourse", "==", uidCourse));
        const querySnapshot = await reporteDocRef
          .where('uidCurso', '==', uidCourse)
          .get();

        // Actualizar los documentos dentro de la transacción
        querySnapshot.forEach((documentSnapshot) => {
          const docRef = reporteDocRef.doc(documentSnapshot.id);

          transaction.update(docRef, {
            descriptionCurso: data.name + ' ' + data.parallel,
          });
        });
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateNameTeacherDetailsPlanificationReport(
    reporIde: string,
    data: any
  ) {
    try {
      const planiDocRef = this.afs
        .collection(COLLECTION_NAME_REPORT)
        .doc(reporIde);

      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.afs.firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(planiDocRef.ref);

        // Obtener el arreglo actual, se pasa el campo a leer
        const items = userDoc.get('details_planification') || [];

        // buscar el index  donde el uid_teacher sea igual al uid del teacher que subio el reporte
        const index = items.findIndex(
          (item: any) => item.uid_teacher == data.uid_teacher
        );

        // si el indice es diferente a -1, es porque el item existe en el arreglo
        if (index !== -1) {
          // actualizar el item en el arreglo, solo se actualiza el status
          items[index].fullName = data.fullName;
        }

        // Actualizar el documento con el nuevo arreglo
        transaction.update(planiDocRef.ref, { details_planification: items });

        // console.log('transaction updateNameTeacherDetailsPlanificatio', items);
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getAllReportes() {
    return this.afs.collection(COLLECTION_NAME_REPORT).get();
  }
}
