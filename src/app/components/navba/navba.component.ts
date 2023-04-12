import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { ModelBaseTeacher } from 'src/app/modules/teacher/models/teacher';

@Component({
  selector: 'app-navba',
  templateUrl: './navba.component.html',
  styleUrls: ['./navba.component.scss']
})
export class NavbaComponent  implements OnInit{
  
  userData: ModelBaseTeacher;
  
  // Inyect the service in the constructor tokenService
  constructor(private tokenService: TokenService) { }
  
    ngOnInit(): void {

      this.userData = JSON.parse(this.tokenService.getToken() as  string);
    }

    

}
