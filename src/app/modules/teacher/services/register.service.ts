
import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModelTeacher } from '../models/teacher';

import { AngularFirestore } from '@angular/fire/compat/firestore';

const COLLECTION_NAME = 'teachers';
@Injectable({
  providedIn: 'root'
})
export class RegisterService  implements OnInit{


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


  findAllTeachers(): Observable<any> {
    return this.firestore.collection(COLLECTION_NAME).snapshotChanges();
  }

  updateTeacher(teacher: ModelTeacher): Promise<any> {
    return this.firestore.collection(COLLECTION_NAME).doc(teacher.dni).update(teacher);
  }


}
