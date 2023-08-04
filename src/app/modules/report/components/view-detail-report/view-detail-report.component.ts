import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-detail-report',
  templateUrl: './view-detail-report.component.html',
  styleUrls: ['./view-detail-report.component.scss']
})
export class ViewDetailReportComponent  implements OnInit{
  
  planificationsDetails: any;
  constructor(  public modal: NgbActiveModal,) { }
  ngOnInit(): void {
  }


}
