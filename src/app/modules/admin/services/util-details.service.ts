import { Injectable, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { WeekModel } from '../models/week.model';
import { PlanificationModel } from '../models/planification.model';

/**
 * Service by refresh data in the components details of the course
 */
@Injectable({
  providedIn: 'root'
})
export class UtilDetailsService implements OnInit {


  private subjectWeeks = new Subject<void>();
  private subjectPlanification = new Subject<void>();

  private subjectDetailPlanification = new Subject<PlanificationModel>();
  


  constructor() { }

  ngOnInit(): void {
  }


  get refreshDataWeek () : Subject<void> {
    return this.subjectWeeks;
  }

  get refreshDataPlanification () : Subject<void> {
    return this.subjectPlanification;
  }

  get refreshDataDetailPlanification () : Subject<PlanificationModel> {
    return this.subjectDetailPlanification;
  }




  refreshWeeksAsObservable() :Observable<void> {
     return this.subjectWeeks.asObservable();
  }


  refreshPlanificationAsObservable() :Observable<void> {
    return this.subjectPlanification.asObservable();
  }
  


  refreshDetailPlanificationAsObservable() :Observable<PlanificationModel> {

    return this.subjectDetailPlanification.asObservable();
  }
    
}
