import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterPeriodosComponent } from '../../components/register-periodos/register-periodos.component';

@Component({
  selector: 'app-periodo',
  templateUrl: './periodo.component.html',
  styleUrls: ['./periodo.component.scss']
})
export class PeriodoComponent  implements OnInit{

  flagClose = true;

  isAdmin: boolean = false;

  constructor(
    private modal: NgbModal
  ) { }

  ngOnInit(): void {
  }

  onClickMenu(value:boolean){  

    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }

  openModal(){


    const ref = this.modal.open(RegisterPeriodosComponent, {
     size: 'md',
      backdrop: 'static',
      keyboard: false,
   });

   ref.componentInstance.data = {
    id: null,
    action:'CREATE'
  } 
 }

}
