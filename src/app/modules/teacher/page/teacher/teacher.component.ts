import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from '../../components/register/register.component';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss']
})
export class TeacherComponent  implements OnInit{


  flagClose = true;

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


    this.modal.open(RegisterComponent, {
      size: 'md',
    });
  }
}
