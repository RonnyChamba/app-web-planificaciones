import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PeriodosService } from 'src/app/modules/admin/services/periodos.service';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { RegisterPeriodosComponent } from '../register-periodos/register-periodos.component';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-periodos',
  templateUrl: './list-periodos.component.html',
  styleUrls: ['./list-periodos.component.scss']
})
export class ListPeriodosComponent implements OnInit, OnDestroy {

  data: any[] = [];

  private subscription = new Subscription();
  constructor(
    private periodoService: PeriodosService,
    private messageService: MensajesServiceService,
    private modalService: NgbModal,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private loadData() {

    this.messageService.loading(true, "Cargando periodos académicos");


    this.subscription = this.periodoService.findAllPeriodosActivos().subscribe((data: any) => {
      this.data = data.map((e: any) => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        }
      });
      console.log(this.data);

      this.messageService.loading(false);
    }
    );

  }

   async delete(item: any) {

       // console.log('uid', uid);
       try {
        Swal.fire({
          title: '¿Estas seguro?',
          text: `Estas seguro de eliminar el periodo académico`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
  
          confirmButtonText: `Si, eliminar`,
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
  
            this.messageService.loading(true, "Eliminando periodo académico");
    
            try {
      
              const response = await this.periodoService.deletePeriodo(item.id);
              console.log(response);
              this.messageService.loading(false);
              this.toaster.info("Periodo académico eliminado correctamente", "Eliminación exitosa");
            } catch (error) {
              console.log(error);
              this.messageService.loading(false);
              this.toaster.error("Error al eliminar el periodo académico", "Error");
            }
  
  
          }
        });
  
  
  
      } catch (err) {
        console.log(err);
  
      }

  }
  editar(item: any) {

    const ref = this.modalService.open(RegisterPeriodosComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });

    ref.componentInstance.data = {
      id: item.id,
      action: 'UPDATE'
    }


  }

}
