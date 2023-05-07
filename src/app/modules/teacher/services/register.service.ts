
import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {  ModelTeacher } from '../models/teacher';

import { AngularFirestore } from '@angular/fire/compat/firestore';

const COLLECTION_NAME = 'teachers';
@Injectable({
  providedIn: 'root'
})
export class RegisterService  implements OnInit{


  passwordSession = '';

  constructor(private firestore: AngularFirestore) { }



  ngOnInit() {

  }


  saveTeacher(teacher: ModelTeacher): Promise<any>{
    // Save teacher in Firestore with id auto generated
    // return this.firestore.collection('teachers').add(teacher);
    
    // Save teacher in Firestore with id custom, and not return data

    return this.firestore.collection(COLLECTION_NAME).doc(teacher.dni).set(teacher);
  }

  findTeacher(cedula: string): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME, ref => ref.where('dni', '==', cedula)).get();
  }


  findTeacherByEmail(email: string): Observable<any> {  
    return this.firestore.collection(COLLECTION_NAME, ref => ref.where('email', '==', email)).get();
  }
  

  deleteTeacher(cedula: string): Promise<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(cedula).delete();
  }


  findAllTeachersOnChanges(): Observable<any> {
    
    return this.firestore.collection(COLLECTION_NAME).snapshotChanges();
  }

  findAllTeachersByCourseOnChanges(course: any): Observable<any> {
    
  
    return this.firestore.collection(COLLECTION_NAME, ref => ref.where('courses', 'in', [course])).snapshotChanges();
  }

  findAllTeachers(): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME).get();
  }

  updateTeacher(teacher: ModelTeacher): Promise<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(teacher.dni).update(teacher);
  }

  updateTeacherPart(teacher: ModelTeacher, uid: string): Promise<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(uid).update({
      displayName: teacher.displayName,
      lastName: teacher.lastName,
      phoneNumber: teacher.phoneNumber,
      titles: teacher.titles,

    } );
  }

  updateStatusTeacher(uid: string, status: boolean): Promise<any> {
    
    return this.firestore.collection(COLLECTION_NAME).doc(uid).update({ status });
  }

  

  findTeacherById(id: string): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(id).get();
  }

  findTeacherByInIde(ids: string[]): Observable<any> {
    // return this.firestore.collection(COLLECTION_NAME).doc(id).get();

    console.log(ids);

    return this.firestore.collection(COLLECTION_NAME, ref => ref.where('uid', 'in', ids)).get();
  }


  get password(): string {

    return this.passwordSession;
  }

  set password(password: string) {

    this.passwordSession = password;
  }
  

  async updateCoursesTeacher(uidTeacher: string, newCourse: any) {


    try {
      const teacherDocRef = this.firestore.collection(COLLECTION_NAME).doc(uidTeacher);
      // Use una transacción para asegurarse de que ningún otro proceso modifique el arreglo al mismo tiempo
      await this.firestore.firestore.runTransaction(async (transaction) => {

        const userDoc = await transaction.get(teacherDocRef.ref);

        // Obtener el arreglo actual de curso del docente, se pasa el campo a leer 
        const items = userDoc.get('courses') || [];

        // Agregar el nuevo curso al arreglo
        items.push(newCourse);

        // Actualizar el documento con el nuevo arreglo de cursos del docente
        transaction.update(teacherDocRef.ref, { courses: items});


      })
      return Promise.resolve(true);

    } catch (error) {
      return Promise.reject(error);

    }
  }

  async updateRemoveCoursesTeacher(uidTeacher: string, uidCourse: any) {


    try {
      const teacherDocRef = this.firestore.collection(COLLECTION_NAME).doc(uidTeacher);
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
        transaction.update(teacherDocRef.ref, { courses: items});


      })
      return Promise.resolve(true);

    } catch (error) {
      return Promise.reject(error);

    }
  }


}
