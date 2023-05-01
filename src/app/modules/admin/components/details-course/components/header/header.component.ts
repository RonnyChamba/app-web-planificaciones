import { Component, Input } from '@angular/core';
import { CourseFullModel } from 'src/app/modules/admin/models/course.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  
  @Input() courseFullModel: CourseFullModel;

}
