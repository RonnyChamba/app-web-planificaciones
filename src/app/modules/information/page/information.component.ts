import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit  {

  flagClose = true;

  isAdmin: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onClickMenu(value:boolean){  

    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }

}
