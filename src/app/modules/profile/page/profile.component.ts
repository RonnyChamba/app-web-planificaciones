import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../auth/services/token.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  // templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
 

  flagClose = true;

  isAdmin: boolean = false;

  constructor(
    private tokenService: TokenService,
    private toaster: ToastrService) {

    this.isAdmin = this.tokenService.isLoggedAdmin();
     }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  onClickMenu(value:boolean){  

    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }


}
