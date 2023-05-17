import { Component, Input } from '@angular/core';
import { CourseFullModel } from 'src/app/modules/admin/models/course.model';

@Component({
  selector: 'app-list-planification',
  templateUrl: './list-planification.component.html',
  styleUrls: ['./list-planification.component.scss']
})
export class ListPlanificationComponent {

  @Input()  courseFullModel: CourseFullModel;

  
  // represent the current week, this is used to show the planification of the current week
  indexWeekCurrent: number = 0;

  constructor() { }


  get planificationExistByCurrentWeek() {

    return (this.verifyIfExistWeeks && (this.courseFullModel.weeks[this.indexWeekCurrent] &&
      this.courseFullModel.weeks[this.indexWeekCurrent].planifications
      && this.courseFullModel.weeks[this.indexWeekCurrent].planifications.length > 0));
  }

  get verifyIfExistWeeks() {

    return (this.courseFullModel && this.courseFullModel.weeks && this.courseFullModel.weeks.length > 0);

  }


}
