import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PlanificationModel } from '../models/planification.model';

const  COLLECTION_NAME = 'planifications';

@Injectable({
  providedIn: 'root'
})
export class PlanificationService  implements OnInit{

  constructor( private afs: AngularFirestore) { }

  ngOnInit(): void {

  }

  savePlanification(data: PlanificationModel)  {

    console.log(data);
    
    return this.afs.collection(COLLECTION_NAME).add(data);
  }

  findPlanificationByWeeksId(weeksId: string) {
    return this.afs.collection(COLLECTION_NAME, ref => ref.where('week', '==', weeksId).orderBy('timestamp', 'desc')).get();
  }

  getPlanificationById(uid: string) {
    return this.afs.collection(COLLECTION_NAME).doc(uid).get();
  }



}
