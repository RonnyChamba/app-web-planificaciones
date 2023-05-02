import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WeekModel } from '../../models/week.model';

@Component({
  selector: 'app-list-week',
  templateUrl: './list-week.component.html',
  styleUrls: ['./list-week.component.scss']
})
export class ListWeekComponent implements OnInit {

  @Input() weeks: WeekModel[] = [];

  // Para saber que semana debe aparecer activa, yo se que la semana 1 es la activa por defecto, yo le puse
  // varios valores, pero pueden ser menos valores, ya que el sistema tendra creo que maxmo 3 semanas
  linkActive: boolean[] = [true, false, false, false, false, false, false, false];
  
  @Output() weekSelected = new EventEmitter<number>();
  @Output() openModal = new EventEmitter<any>();
  constructor() { }


  ngOnInit(): void {



  }
  changeNumberWeek(week: number) {

    // Para saber que semana debe aparecer activa
    for (let i = 0; i < this.linkActive.length; i++) {
      this.linkActive[i] =  week == i;

    }
    this.weekSelected.emit(week);
  }

  openModalWeeks() {
    // Emito cualquier cosa, solo es para que se abra el modal
    this.openModal.emit(10);
  }

}
