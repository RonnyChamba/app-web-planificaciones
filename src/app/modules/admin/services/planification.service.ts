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
    return this.afs.collection(COLLECTION_NAME).add(data);
  }


}
