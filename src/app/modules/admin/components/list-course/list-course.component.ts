import { Component, OnDestroy, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CourseModel } from '../../models/course.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-course',
  templateUrl: './list-course.component.html',
  styleUrls: ['./list-course.component.scss']
})
export class ListCourseComponent implements OnInit, OnDestroy {


  courses: CourseModel[] = [];

private subscriptionList: Subscription;

  constructor(
    private courseService: CourseService,
    private roter: Router) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnDestroy(): void { 

    if (this.subscriptionList) {
      this.subscriptionList.unsubscribe();
    }
    
  }

  async loadCourses() {

    this.subscriptionList =  this.courseService.findAllCourses().subscribe((resp: any) => {

      this.courses = [];
      resp.forEach((item: any) => {

        const course: CourseModel = item.payload.doc.data() as CourseModel;
        course.uid = item.payload.doc.id;

        course.tutor = course.tutor.fullName || "NO ASIGNADO";
        this.courses.push(course);
        console.log("course ---");
      });

    });
  }

  viewCourse(uid: string) {
    console.log(uid);
    this.roter.navigate(['/course', uid]);
  }

}
