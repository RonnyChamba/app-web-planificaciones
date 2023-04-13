import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PlanificationModel } from '../../models/planification.model';
import { Subscription } from 'rxjs';
import { UtilDetailsService } from '../../services/util-details.service';

@Component({
  selector: 'app-detail-planification',
  templateUrl: './detail-planification.component.html',
  styleUrls: ['./detail-planification.component.scss']
})
export class DetailPlanificationComponent implements OnInit , OnDestroy{

  planification: PlanificationModel;

  
  // here add suscriptiones
  private subscription: Subscription = new Subscription();
  constructor(private utilDetailsService: UtilDetailsService) { }

  ngOnInit(): void {

    console.log("planificacion recibida",  this.planification);
    
    this.subscription.add(
      this.utilDetailsService.refreshDetailPlanificationAsObservable().subscribe(
        (planification: PlanificationModel) => {
          this.planification = planification;
          console.log("planificacion recibida",  this.planification);
        }
      ) 
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }




}
