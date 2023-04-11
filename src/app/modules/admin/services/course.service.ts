import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CourseModel } from '../models/course.model';


const  COLLECTION_NAME = 'courses';
@Injectable({
  providedIn: 'root'
})
export class CourseService  implements OnInit{

  constructor( private afs: AngularFirestore) { }

  ngOnInit(): void {


  }


  saveCourse(data: CourseModel)  {
    return this.afs.collection(COLLECTION_NAME).add(data);
  }


  findCouseByNameAndParalelo(name: string, paralelo: string) {
    return this.afs.collection(COLLECTION_NAME, ref => ref.where('name', '==', name).where('parallel', '==', paralelo)).get();
  }

  

  findAllCourses(): any {
    
  
    
    return this.afs.collection(COLLECTION_NAME).snapshotChanges();
  }


  
}
