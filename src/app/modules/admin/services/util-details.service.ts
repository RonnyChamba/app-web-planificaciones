import { Injectable, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { WeekModel } from '../models/week.model';

/**
 * Service by refresh data in the components details of the course
 */
@Injectable({
  providedIn: 'root'
})
export class UtilDetailsService implements OnInit {


  private subjectWeeks = new Subject<void>();


  constructor() { }

  ngOnInit(): void {
  }


  get refreshDataWeek () : Subject<void> {
    return this.subjectWeeks;
  }



  refreshWeeksAsObservable() :Observable<void> {
     return this.subjectWeeks.asObservable();
  }



}
