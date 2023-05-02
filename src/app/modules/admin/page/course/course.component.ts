import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent   implements OnInit {

  uidCourse: string = "";
  flagClose = true;
  constructor( private activePath: ActivatedRoute) { }

  ngOnInit(): void {
  
    this.uidCourse =  this.activePath.snapshot.params['uid'];
    // console.log(`Id Customer get : ${this.ideCustomer}`);

    this.activePath.params.subscribe(
      (params: Params) => {
        this.uidCourse =  params['uid'];
        
        // console.log(`Id Customer get : ${this.uidCourse}`);
      }   
      );


  }

  onClickMenu(value:boolean){  

    this.flagClose = value;

    // this.tokenService.setFlagClose(this.flagClose);
  }

}
