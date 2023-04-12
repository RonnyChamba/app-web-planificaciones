import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CourseModel } from '../../models/course.model';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-course',
  templateUrl: './list-course.component.html',
  styleUrls: ['./list-course.component.scss']
})
export class ListCourseComponent implements OnInit {


  courses: CourseModel[] = [];

  constructor(private courseService: CourseService,
    private roter: Router,
    private teacherService: RegisterService) { }

  ngOnInit(): void {
    this.loadCourses();
  }


  async loadCourses() {

    const teachers: ModelTeacher[] = [];
    const resp = await firstValueFrom(this.teacherService.findAllTeachers());

    console.log(resp);

    resp.docs.forEach((item: any) => {
      // console.log(item.data());
      teachers.push(item.data() as ModelTeacher);

    });

    console.log(teachers);

    this.courseService.findAllCourses().subscribe((resp: any) => {

      resp.forEach((item: any) => {

        const course: CourseModel = item.payload.doc.data() as CourseModel;
        course.uid = item.payload.doc.id;


        const teacher = teachers.find((item) => item.uid == course.tutor);
        course.tutor = teacher?.displayName || "NO ASIGNADO";
        // console.log(teachers);
        // console.log(course);


        this.courses.push(course);
      });

    });
  }

  viewCourse(uid: string) {
    console.log(uid);
    this.roter.navigate(['/course', uid]);
  }

}
