import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { WeekModelBase } from '../models/week.model';

const COLLECTION_NAME = 'weeks';
@Injectable({
  providedIn: 'root'
})
export class WeekService  implements OnInit{

  constructor(private afs: AngularFirestore) { }

  ngOnInit(): void {

  }


  saveWeek(week: WeekModelBase){
    console.log('saveWeek', week);

    // const tareasRef = this.afs.firestore().collection('tareas');

    return this.afs.collection(COLLECTION_NAME).add(week);
  }
  


  findWeeksByCourseId(courseId: string) {
    console.log('findWeeksByCourseId', courseId);
    // return this.afs.collection(COLLECTION_NAME, ref => ref.where('course', '==', courseId)).get();

    return this.afs.collection(COLLECTION_NAME, ref => ref.where('course', '==', courseId).orderBy('timestamp', 'asc')  ).get();
   }

   findAllWeeks() {
      
      return this.afs.collection(COLLECTION_NAME).get();
    }
}
