import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CourseFullModel } from 'src/app/modules/admin/models/course.model';
import { SelectTeacherComponent } from '../select-teacher/select-teacher.component';
import { TokenService } from 'src/app/modules/auth/services/token.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  
  @Input() courseFullModel: CourseFullModel;
  isAdmin: boolean = false;

  constructor(

    private modal: NgbModal,
    private tokenService: TokenService,

  ) { 

    this.isAdmin = this.tokenService.isLoggedAdmin();
  }
  
  ngOnInit(): void {
  
  }

  addTeacher() {
  
    // alert('addTeacher');

   const ref = this.modal.open(SelectTeacherComponent, 
      {
        
        size: 'lg', 
      backdrop: 'static', 
      keyboard: false, 
      centered: true,
      // windowClass: 'modal-holder',
      scrollable: true 
   });

    ref.componentInstance.uidCourse = this.courseFullModel.uid;
  }


}
