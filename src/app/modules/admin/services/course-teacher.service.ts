import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';


const COLLECTION_NAME = 'courses_teacher';
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


   setCourseTeacher(courseId: string, teacherId: string) {

    return this.afs.collection(COLLECTION_NAME).add({ course: courseId, teacher: teacherId });

   }

}
