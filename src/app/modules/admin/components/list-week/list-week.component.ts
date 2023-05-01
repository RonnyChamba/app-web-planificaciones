import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WeekModel } from '../../models/week.model';

@Component({
  selector: 'app-list-week',
  templateUrl: './list-week.component.html',
  styleUrls: ['./list-week.component.scss']
})
export class ListWeekComponent {

  @Input() weeks: WeekModel[] = [];

  @Output() weekSelected= new EventEmitter<number>();
  @Output() openModal= new EventEmitter<any>();
  constructor() { }

  changeNumberWeek(week: number){

    this.weekSelected.emit(week);
  }

  openModalWeeks(){
    // Emito cualquier cosa, solo es para que se abra el modal
    this.openModal.emit(10);
  }

}
