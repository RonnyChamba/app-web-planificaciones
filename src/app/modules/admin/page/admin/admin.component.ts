import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { FormCourseComponent } from '../../components/form-course/form-course.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent  implements OnInit{

  flagClose = true;

  constructor(private tokenService: TokenService,
    private router: Router,
    private toaster: ToastrService,
    private modalService: NgbModal,) { }

  ngOnInit(): void {


    if (!this.tokenService.verifyToken()) {
      this.router.navigate(['/auth']);
       this.toaster.error('No tienes permisos para acceder a esta ruta', 'Error');
    }

  }
  openCourse() {
   
   
    this.modalService.open(FormCourseComponent, { size: 'md' });
  }

  onClickMenu(value:boolean){  

    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }



}
