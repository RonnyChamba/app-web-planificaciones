import { Component, Input, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent  implements OnInit {

  menuOptions = new Map<string, any>;

  
  // Recibimos la variable open desde el padre pero le damos un alias flagClose
  @Input('open') flagClose: boolean;

  isAdmin = false;

  constructor(

    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {

    this.initMenuOptiosn();
  }

  private initMenuOptiosn (){

    this.menuOptions.set("HOME", "Cursos");
    this.menuOptions.set("DOCENTES", "Docentes");
  }


  showSubmenu(event: any){
  
    // Obtener el padre del padre del evento (Li es punto final)
    let liParent = event.target.parentElement.parentElement;
    
    // Obtener clases
    let listClass = [...liParent.classList];

    if (listClass.includes("showMenu")) {

      this.renderer.removeClass(liParent, "showMenu");

    }else  this.renderer.addClass(liParent, "showMenu");

  
  }

}
