import { Injectable, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
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
  private subjectDetailPlanification = new Subject<any>();

  // Para la observacion del componente review
  private subjectReviewPlanification = new Subject<any>();

  // Para la observacion del componente teacher
  private subjectTeacher = new Subject<any>();

  // Para la observacion del componente currentPeriodo, cuando selecciona un periodo en el select de periodos
  // listar los cursos de ese periodo, le pasamos el id del periodo
  private subjectCurrentPeriodo = new Subject<any>();


  constructor() { }

  ngOnInit(): void {
  }

  get refreshDataCurrentPeriodo(): Subject<any> {
    return this.subjectCurrentPeriodo;
  }

  get refreshDataWeek(): Subject<void> {
    return this.subjectWeeks;
  }

  get refreshDataPlanification(): Subject<void> {
    return this.subjectPlanification;
  }

  get refreshDataDetailPlanification(): Subject<any> {
    return this.subjectDetailPlanification;
  }


  get refreshDataReview(): Subject<any> {
    return this.subjectReviewPlanification;
  }

  get refreshDataTeacher(): Subject<any> {

    return this.subjectTeacher;
  }

  refreshWeeksAsObservable(): Observable<void> {
    return this.subjectWeeks.asObservable();
  }


  refreshPlanificationAsObservable(): Observable<void> {
    return this.subjectPlanification.asObservable();
  }


  refreshDetailPlanificationAsObservable(): Observable<PlanificationModel> {

    return this.subjectDetailPlanification.asObservable();
  }

}
