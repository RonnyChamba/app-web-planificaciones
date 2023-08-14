import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { FormCourseComponent } from '../../components/form-course/form-course.component';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { PeriodosService } from '../../services/periodos.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UtilDetailsService } from '../../services/util-details.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  flagClose = true;

  isAdmin: boolean = false;
  periodos: any[] = [];

  // creare un formControl para el select de periodos
  // y un metodo para cargar los periodos

  formControlPeriodo: FormControl = new FormControl();

  private subscription = new Subscription();
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private toaster: ToastrService,
    private modalService: NgbModal,
    private periodosService: PeriodosService,
    private utilService: UtilDetailsService
  ) {
    this.isAdmin = this.tokenService.isLoggedAdmin();
  }

  ngOnInit(): void {
    if (!this.tokenService.verifyToken()) {
      this.router.navigate(['/auth']);
      this.toaster.error(
        'No tienes permisos para acceder a esta ruta',
        'Error'
      );
    }

    this.subscription = this.periodosService
      .findAllPeriodosActivos()
      .subscribe((data: any) => {
        // console.log(data);

        this.periodos = data.map((e: any) => {
          return {
            id: e.payload.doc.id,
            ...e.payload.doc.data(),
          };
        });
        console.log(this.periodos);
        if (this.periodos.length > 0) {
          // asignamos el periodo actual al formControl del select como valor por defecto, corresponde al ultimo periodo registrado
          this.formControlPeriodo.setValue(this.periodos[0].id);
        }
      });

    this.formControlPeriodo.valueChanges.subscribe((value) => {
      const periodo = this.periodos.find((periodo: any) => periodo.id == value);
      // guardamos el periodo del select actual en el localstorage
      this.tokenService.setCurrentPeriodo(periodo);

      // pasamos el ide del periodo seleccionado para cargar los cursos correspondientes a ese periodo
      this.utilService.refreshDataCurrentPeriodo.next(value);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openCourse() {
    this.modalService.open(FormCourseComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  onClickMenu(value: boolean) {
    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }
}
