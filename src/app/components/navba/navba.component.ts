import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/modules/auth/services/login.service';
import { TokenService } from 'src/app/modules/auth/services/token.service';
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


}
