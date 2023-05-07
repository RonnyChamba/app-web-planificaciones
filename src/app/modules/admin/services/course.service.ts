import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CourseModel } from '../models/course.model';


const COLLECTION_NAME = 'courses';
@Injectable({
  providedIn: 'root'
})
export class CourseService implements OnInit {

  constructor(private afs: AngularFirestore) { }

  ngOnInit(): void {


  }


  saveCourse(data: CourseModel) {
    return this.afs.collection(COLLECTION_NAME).add(data);
  }


  findCouseByNameAndParalelo(name: string, paralelo: string) {
    return this.afs.collection(COLLECTION_NAME, ref => ref.where('name', '==', name).where('parallel', '==', paralelo)).get();
  }



  findAllCourses(): any {

    // snapshotChanges EMIte un evento cada vez que hay un cambio en la base de datos, HAY QUE TENER CUIDADO CON ESTO Y HACER UNSUBSCRIBE
    return this.afs.collection(COLLECTION_NAME).snapshotChanges();
  }
  
  findCourseById(uid: string) {
    return this.afs.collection(COLLECTION_NAME).doc(uid).get();
  }




}
