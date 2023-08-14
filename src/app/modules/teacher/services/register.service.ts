import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModelTeacher } from '../models/teacher';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { typeFilterField } from 'src/app/util/types';

const COLLECTION_NAME = 'teachers';
@Injectable({
  providedIn: 'root',
})
export class RegisterService implements OnInit {
  passwordSession = '';

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {}

  saveTeacher(teacher: ModelTeacher): Promise<any> {
    // Save teacher in Firestore with id auto generated
    // return this.firestore.collection('teachers').add(teacher);

    // Save teacher in Firestore with id custom, and not return data

    return this.firestore
      .collection(COLLECTION_NAME)
      .doc(teacher.dni)
      .set(teacher);
  }

  findTeacher(cedula: string): Observable<any> {
    return this.firestore
      .collection(COLLECTION_NAME, (ref) => ref.where('dni', '==', cedula))
      .get();
  }

  findTeacherByEmail(email: string): Observable<any> {
    return this.firestore
      .collection(COLLECTION_NAME, (ref) => ref.where('email', '==', email))
      .get();
  }

  findTeacherByEmailOrDni(
    type: typeFilterField,
    value: string,
    uidUpdateOrNew: any
  ): Observable<any> {
    let operator: any = uidUpdateOrNew ? '!=' : '==';

    // validar cuando edita
    if (uidUpdateOrNew) {
      if (type == 'DNI') {
        return this.firestore
          .collection(COLLECTION_NAME, (ref) =>
            ref.where('uid', '!=', uidUpdateOrNew).where('dni', '==', value)
          )
          .get();
      }

      // de esta consulta falta que se cree el indice en firestore, sim embargo como el email cuando el admin edita el docente no es editable, entonce
      // por ahora no se crea el indice
      return this.firestore
        .collection(COLLECTION_NAME, (ref) =>
          ref.where('uid', '!=', uidUpdateOrNew).where('email', '==', value)
        )
        .get();
    }

    // validar cuando crear un nuevo registro

    if (type == 'DNI') {
      return this.firestore
        .collection(COLLECTION_NAME, (ref) => ref.where('dni', '==', value))
        .get();
    }
    return this.firestore
      .collection(COLLECTION_NAME, (ref) => ref.where('email', '==', value))
      .get();
  }

  deleteTeacher(cedula: string): Promise<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(cedula).delete();
  }

  findAllTeachersOnChanges(): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME).snapshotChanges();
  }

  findAllTeachersByCourseOnChanges(course: any): Observable<any> {
    return this.firestore
      .collection(COLLECTION_NAME, (ref) =>
        ref.where('courses', 'in', [course])
      )
      .snapshotChanges();
  }

  findAllTeachers(): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME).get();
  }

  updateTeacher(teacher: ModelTeacher): Promise<any> {
    return this.firestore
      .collection(COLLECTION_NAME)
      .doc(teacher.dni)
      .update(teacher);
  }

  updateTeacherPart(teacher: ModelTeacher, uid: string): Promise<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(uid).update({
      displayName: teacher.displayName,
      lastName: teacher.lastName,
      phoneNumber: teacher.phoneNumber,
      titles: teacher.titles,
    });
  }

  updateStatusTeacher(uid: string, status: boolean): Promise<any> {
    return this.firestore
      .collection(COLLECTION_NAME)
      .doc(uid)
      .update({ status });
  }

  findTeacherById(id: string): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(id).get();
  }

  findTeacherByInIde(ids: string[]): Observable<any> {
    // return this.firestore.collection(COLLECTION_NAME).doc(id).get();

    console.log(ids);

    return this.firestore
      .collection(COLLECTION_NAME, (ref) => ref.where('uid', 'in', ids))
      .get();
  }

  get password(): string {
    return this.passwordSession;
  }

  set password(password: string) {
    this.passwordSession = password;
  }

  async updateCoursesTeacher(uidTeacher: string, newCourse: any) {
    try {
      const teacherDocRef = this.firestore
        .collection(COLLECTION_NAME)
        .doc(uidTeacher);
      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.firestore.firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(teacherDocRef.ref);

        // Obtener el arreglo actual de curso del docente, se pasa el campo a leer
        const items = userDoc.get('courses') || [];

        // Agregar el nuevo curso al arreglo
        items.push(newCourse);

        // Actualizar el documento con el nuevo arreglo de cursos del docente
        transaction.update(teacherDocRef.ref, { courses: items });
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateRemoveCoursesTeacher(uidTeacher: string, uidCourse: any) {
    try {
      const teacherDocRef = this.firestore
        .collection(COLLECTION_NAME)
        .doc(uidTeacher);
      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.firestore.firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(teacherDocRef.ref);

        // Obtener el arreglo actual de curso del docente, se pasa el campo a leer
        const items = userDoc.get('courses') || [];

        // Agregar el nuevo curso al arreglo

        const index = items.indexOf(uidCourse);

        if (index > -1) {
          items.splice(index, 1);
        }

        // items.push(newCourse);

        // Actualizar el documento con el nuevo arreglo de cursos del docente
        transaction.update(teacherDocRef.ref, { courses: items });
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateTeacherPartMoreDni(teacher: ModelTeacher, uid: string) {
    try {
      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.firestore.firestore.runTransaction(async (transaction) => {
        // referencia al docente
        const teacherRef = this.firestore
          .collection(COLLECTION_NAME)
          .doc(uid).ref;

        console.log('teacherRef', teacherRef);

        transaction.update(teacherRef, {
          displayName: teacher.displayName,
          lastName: teacher.lastName,
          phoneNumber: teacher.phoneNumber,
          titles: teacher.titles,
          dni: teacher.dni,
        });

        console.log('teacher actualizado ....');

        // referencia al curso que tiene como tutor el docente
        const teacherCursosRef = this.firestore.collection('courses').ref;

        const querySnapshot = await teacherCursosRef
          .where('tutor.uid', '==', uid)
          .get();

        // indica que el docente si esta asignado como tutor algun curso
        if (!querySnapshot.empty) {
          querySnapshot.forEach((documentSnapshot) => {
            const docRef = teacherCursosRef.doc(documentSnapshot.id);

            transaction.update(docRef, {
              tutor: {
                fullName: teacher.displayName + ' ' + teacher.lastName,
                uid: uid,
              },
            });
          });
        }

        console.log('teacher curso actualizado .....');

        // referencia a los details_planification donde el docente se encuentra presente
        const teacherDetailPlanificationRef = this.firestore.collection(
          'details_planification'
        ).ref;

        const querySnapshotPlani = await teacherDetailPlanificationRef
          .where('teacher.uid', '==', uid)
          .get();

        if (!querySnapshotPlani.empty) {
          querySnapshotPlani.forEach((documentSnapshot) => {
            const docRef = teacherDetailPlanificationRef.doc(
              documentSnapshot.id
            );

            transaction.update(docRef, {
              teacher: {
                email: teacher.email,
                fullName: teacher.displayName + ' ' + teacher.lastName,
                uid: uid,
              },
            });
          });
        }

        console.log('teacher Details_Planification  actualizado .....');

        // referencia a reportes  donde el docente se encuentra presente
        // const teacherReporteRef = this.firestore.collection('reportes').ref;

        // const querySnapshotReport = await teacherReporteRef.get();

        // if (!querySnapshotReport.empty) {
        //   querySnapshotReport.forEach(async (documentSnapshot) => {
        //     const docRef = teacherReporteRef.doc(documentSnapshot.id);

        //     const item: any = await docRef.get();

        //     // aqui se obtiene el documento completo
        //     const data = item.data();
        //     data.uid = item.id;

        //     // obtener del documento el campo details_planificacion
        //     const arrayDetails = data?.details_planification || [];

        //     // verificar si el documento tiene details_planificaciones
        //     if (arrayDetails.length > 0) {
        //       // verificar si el docente esta presente en los detauls
        //       let details = arrayDetails.filter(
        //         (item: any) => item.uid_teacher == uid
        //       );

        //       // aqui indica que el item actual osea el registro del reporte se encuentra el docente
        //       if (details && details.length > 0) {
        //         const planiDocRef = this.firestore
        //           .collection('reportes')
        //           .doc(data.uid);



        //         const userDoc = await transaction.get(planiDocRef.ref);

        //         // Obtener el arreglo actual, se pasa el campo a leer
        //         const itemsEdit = userDoc.get('details_planification') || [];

        //         // indice donde se encuentra el docente en el arreglo details_planification
        //         const index = itemsEdit.findIndex(
        //           (item: any) => item.uid_teacher == uid
        //         );
        //         console.log('index', index);

        //         // editar un item del arreglo
        //         itemsEdit[index].fullName =
        //           teacher.displayName + ' ' + teacher.lastName;

        //         console.log('arrayDetails', itemsEdit);

        //         // Actualizar el documento con el nuevo arreglo
        //         transaction.update(planiDocRef.ref, {
        //           details_planification: arrayDetails,
        //         });
        //       }
        //     }

        //   });
        // }
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }

    // return this.firestore.collection(COLLECTION_NAME).doc(uid).update({
    //   dni: teacher.dni,
    //   displayName: teacher.displayName,
    //   lastName: teacher.lastName,
    //   phoneNumber: teacher.phoneNumber,
    //   titles: teacher.titles,
    // });
  }
}
