import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PlanificationService } from '../../services/planification.service';
import { PlanificationModel } from '../../models/planification.model';
import { Subscription, catchError, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UtilDetailsService } from '../../services/util-details.service';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit, OnDestroy {

  // se revibe mediante la url
  uidPlanification: string = "";
  // para guardar los datos de la planificación que se esta revisando
  planificationModel: PlanificationModel;
  subscription = new Subscription();
  nameCourse: string = "";
  uidCourseCurrent: string = "";

  flagClose = true;

  constructor(

    private activePath: ActivatedRoute,
    private planificationService: PlanificationService,
    private router: Router,
    private tokenService: TokenService,
    private toaster: ToastrService,
    private messageService: MensajesServiceService
  ) {
    this.setNameCourse();
  }


  ngOnInit() {

    this.messageService.loading(true, "Cargando información ...");
    this.uidPlanification = this.activePath.snapshot.params['uid'];

    this.activePath.params.subscribe(
      (params: Params) => {

        this.uidPlanification = params['uid'];
      }
    );
    this.getPlanification();

    this.addSubscription();

  }

  ngOnDestroy(): void {

    this.subscription.unsubscribe();
  }

  private addSubscription() {


  }

  getPlanification() {

    this.planificationService.getPlanificationById(this.uidPlanification)
      .pipe(

        tap((data: any) => {


          if (!data.exists) {

            this.toaster.info('Planificación no existe', 'Info');
            this.router.navigate(['/home']);
            return;
          }

          // console.log(data);
          this.planificationModel = data.data() as PlanificationModel;
          this.planificationModel.uid = data.id;
          console.log(this.planificationModel);
        }),

        catchError((err: any) => {
          // console.log(err);

          this.toaster.error('Error al obtener la planificación, intentelo despues', 'Error');
          this.router.navigate(['/home']);


          return of(null);

        })
      ).subscribe();

  }

  private setNameCourse() {
    const course = this.tokenService.getCourse();

    console.log(course);
    if (course) {

      const data = JSON.parse(course);
      this.nameCourse = data.name;
      this.uidCourseCurrent = data.uid;


    }
  }

  onClickMenu(value: boolean) {

    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }

  // this.planificationService.getPlanificationById(this.uidPlanification)
}
