import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordComponent } from 'src/app/modules/auth/components/change-password/change-password.component';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { RegisterComponent } from 'src/app/modules/teacher/components/register/register.component';
import { ModelBaseTeacher } from 'src/app/modules/teacher/models/teacher';

@Component({
  selector: 'app-navba',
  templateUrl: './navba.component.html',
  styleUrls: ['./navba.component.scss']
})
export class NavbaComponent implements OnInit {

  userData: ModelBaseTeacher;
  flagClose = true;

  @Output() newItemEvent = new EventEmitter<boolean>();

  // Inyect the service in the constructor tokenService
  constructor(
    private tokenService: TokenService,
    private loginService: LoginService,
    private toaster: ToastrService,
    private modal: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.userData = JSON.parse(this.tokenService.getToken() as string);
  }


  onClickMenu() {

    this.flagClose = !this.flagClose;
    this.newItemEvent.emit(this.flagClose);

  }

  async logOut() {

    try {
      await this.loginService.logOut();
      this.tokenService.clearLocalStorage();
      this.router.navigate(['/auth']);

      this.toaster.success('Sesión cerrada correctamente', 'Sesión cerrada');
    } catch (error) {

      this.toaster.error('Error al cerrar sesión', 'Error');

    }
  }

  changePassword() {


    const ref = this.modal.open(ChangePasswordComponent, { size: 'md' });

    // ref.result.then(
    //   (result) => {
    //     console.log(result);
    //   }
    // ).catch(
    //   (error) => {
    //     console.log(error);
    //   }
    // );



  }


}
