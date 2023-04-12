import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';


const COLLECTION_NAME = 'courses_teacher';
const COLLECTION_NAME_WEEKS = 'weeks';
@Injectable({
  providedIn: 'root'
})
export class CourseTeacherService  implements OnInit{

  constructor(private afs: AngularFirestore) { }

  ngOnInit(): void {
  }



   findTeacherByCourseId(courseId: string) {

    return this.afs.collection(COLLECTION_NAME, ref => ref.where('course', '==', courseId)).get();

   }

   findWeeksByCourseId(courseId: string) {

    console.log('findWeeksByCourseId', courseId);
    return this.afs.collection(COLLECTION_NAME_WEEKS, ref => ref.where('course', '==', courseId)).get();
   }


}
