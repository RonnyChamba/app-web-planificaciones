import { Component, Input } from '@angular/core';
import { CourseFullModel } from 'src/app/modules/admin/models/course.model';

@Component({
  selector: 'app-details-teacher',
  templateUrl: './details-teacher.component.html',
  styleUrls: ['./details-teacher.component.scss']
})
export class DetailsTeacherComponent {

  @Input() courseFullModel: CourseFullModel;
}
