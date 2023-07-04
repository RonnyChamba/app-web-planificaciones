import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, of, tap } from 'rxjs';
import { CourseModel } from 'src/app/modules/admin/models/course.model';
import { CourseService } from 'src/app/modules/admin/services/course.service';
import { PeriodosService } from 'src/app/modules/admin/services/periodos.service';
import { ReportService } from 'src/app/modules/admin/services/report.service';
import { ModelTeacher } from 'src/app/modules/teacher/models/teacher';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import { MensajesServiceService } from 'src/app/services/mensajes-service.service';
import { ViewDetailReportComponent } from '../view-detail-report/view-detail-report.component';
import { jsPDF } from 'jspdf';


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  private subscription = new Subscription();

  periodoCurrent: any;
  periodos: any[] = [];
  courses: CourseModel[] = [];
  trimestres: any[] = [
    {
      id: 1,
      name: "Primer Trimestre"

    },
    {
      id: 2,
      name: "Segundo Trimestre"
    },
    {
      id: 3,
      name: "Tercer Trimestre"
    }
  ];

  dataList: any[] = [];
  private subscriptionList: Subscription;

  private subsLoadTeacher: Subscription = new Subscription();

  constructor(
    private periodosService: PeriodosService,
    private messageService: MensajesServiceService,
    private courseService: CourseService,
    private toaster: ToastrService,
    private teacherService: RegisterService,
    private reportService: ReportService,
    private modalService: NgbModal
  ) { }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionList.unsubscribe();
    this.subsLoadTeacher.unsubscribe();
  }
  ngOnInit(): void {

    this.createForm();
    this.messageService.loading(true);
    this.subscription = this.periodosService.findAllPeriodosActivos().subscribe((data: any) => {


      this.periodos = data.map((e: any) => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        };
      }
      );

      console.log(this.periodos);
      if (this.periodos.length > 0) {

        this.periodoCurrent = this.periodos[0];

        this.formGroup.controls['periodo'].setValue(this.periodoCurrent.id, { emitEvent: false });

        this.loadProperties();
      }
    }, (error: any) => {
      console.log(error);
      this.messageService.loading(false);
    }

    );
    this.onChangeEvent();

  }

  private onChangeEvent() {



    this.formGroup.controls['periodo'].valueChanges.subscribe((value: any) => {
      this.periodoCurrent = this.periodos.find((item: any) => item.id == value);

      this.loadProperties();
    }
    );
  }
  createForm() {
    this.formGroup = new FormGroup({
      periodo: new FormControl("",
        [
          Validators.required,
        ], []),

      trimestre: new FormControl("",
        [

        ]),

      curso: new FormControl("", [Validators.required]),

      estado: new FormControl([],
        [Validators.required]),
    });
  }

  private loadProperties() {

    this.subscriptionList = this.courseService.findAllCoursesByPeriodo(this.periodoCurrent.id)
      .pipe(
        tap(async (resp: any) => {



          // const userCurrent = await this.register.findTeacherById(uidUser).toPromise();

          // const coursesByTeacher = userCurrent.data().courses;

          // console.log("userCurrent", coursesByTeacher);
          this.courses = [];
          resp.forEach((item: any) => {

            const course: CourseModel = item.payload.doc.data() as CourseModel;
            course.uid = item.payload.doc.id;
            course.tutor = course.tutor.fullName || "NO ASIGNADO";

            // // Si es admin, se muestran todos los cursos
            // if (rol == 'ADMIN') {
            //   this.courses.push(course);
            //   return;
            // }

            // Si es tutor, se muestran solo los cursos que tiene asignado
            // if (coursesByTeacher.includes(course.uid)) {
            this.courses.push(course);
            // }

            // console.log("course ---");
          });

          // if (this.courses.length > 0) {
          //   this.formGroup.controls['curso'].setValue(this.courses[0].uid, { emitEvent: false });
          // }

          this.messageService.loading(false);

          // this.loadTeachers();
        }),
        catchError((err) => {
          console.log(err);
          this.messageService.loading(false);
          this.toaster.error("Error al cargar los cursos", "Error");
          return of(null);
        }
        )
      ).subscribe();
  }

  // loadTeachers() {

  //   this.subsLoadTeacher = this.teacherService.findAllTeachersOnChanges()

  //     .pipe(
  //       tap((resp: any) => {

  //         // this.courseFullModel.teachers = [];

  //         // const teachers: ModelTeacher[] = [];

  //         this.trimestres = [];
  //         resp.forEach((element: any) => {

  //           const teacher: ModelTeacher = element.payload.doc.data() as ModelTeacher;
  //           teacher.uid = element.payload.doc.id;

  //           const curso = this.formGroup.controls['curso'].value;

  //           if (teacher.courses?.includes(curso || "")) {
  //             this.trimestres.push(teacher);

  //           }

  //         });

  //         // console.log(teachers);

  //       }),
  //       catchError((err: any) => {
  //         console.log("err", err);
  //         this.messageService.loading(false);
  //         this.toaster.error("Error al cargar los profesores", "Error");
  //         return of(null);
  //       })
  //     ).subscribe();
  //   // console.log("teachers cargado");
  // }


  onClickedFilter() {

    const courseId = this.formGroup.controls['curso'].value;
    // console.log("courseId", this.formGroup.value);

    // console.log("courseId", this.periodoCurrent);


    this.reportService.findAllReportByPeriodo(this.periodoCurrent.id).pipe(
      tap((resp: any) => {
        // console.log("resp", resp);


        if (!resp.empty) {

          const data = resp.docs;

          this.dataList = [];
          data.forEach((element: any) => {

            this.dataList.push(element.data());
          });
          console.log("data", this.dataList);

        }

        this.groupData();


      }),
      catchError((err: any) => {
        console.log("err", err);
        this.messageService.loading(false);
        this.toaster.error("Error al cargar el reporte", "Error");
        return of(null);
      })
    ).subscribe();

  }

  private groupData() {


    if (this.dataList.length > 0) {

      // 1)  first  filter by course

      const courseId = this.formGroup.controls['curso'].value;
      const trimestreId = this.formGroup.controls['trimestre'].value;

      if (courseId != "" && trimestreId != "") {

        const dataFilterByCourse = this.dataList.filter((item: any) => item.uidCurso == courseId);
        
        // filter if the field descriptionTrimestre  contains the trimestreId
        const dataFilterByTrimestre = dataFilterByCourse.filter((item: any) => item.descriptionTrimestre.includes(trimestreId));
        console.log("dataFilterByCourse", dataFilterByCourse);
        this.dataList = dataFilterByTrimestre;
      }

      if (courseId != "" && trimestreId == "") {

        const dataFilterByCourse = this.dataList.filter((item: any) => item.uidCurso == courseId);
        this.dataList = dataFilterByCourse;
      }

      if (courseId == "" && trimestreId != "") {
          
          const dataFilterByTrimestre = this.dataList.filter((item: any) => item.descriptionTrimestre.includes(trimestreId));
          this.dataList = dataFilterByTrimestre;
        }


    }
  }

  viewTeacherAlreadyUpload(item: any) {


    const refModal = this.modalService.open(ViewDetailReportComponent,

      {
        size: 'xl',

        backdrop: 'static',
        keyboard: false
      });
    refModal.componentInstance.planificationsDetails = item;
  }


  generatePDF(){

    const doc = new jsPDF();

    const columnas = ['Nombre', 'Apellido', 'Edad'];
    const filas = [
      ['Juan', 'Perez', '25'],
      ['María', 'López', '30'],
      ['Carlos', 'Gómez', '35'],
    ];

    const margenSuperior = 10;
    const margenIzquierdo = 10;
    const espacioEntreFilas = 10;
    const alturaFila = 10;

    let posicionX = margenIzquierdo;
    let posicionY = margenSuperior;

    // Función para obtener el ancho del texto en una celda
    const getTextWidth = (text: string): number => {
      const fontSize = 12; // Tamaño de fuente utilizado
      const textWidth = doc.getStringUnitWidth(text) * fontSize;
      return textWidth;
    };

    // Ajustar el ancho de las columnas al contenido de texto
    const calcularAnchoColumnas = () => {
      columnas.forEach((columna, index) => {
        let maxTextWidth = getTextWidth(columna);

        filas.forEach((fila) => {
          const dato = fila[index];
          const textWidth = getTextWidth(dato);
          maxTextWidth = Math.max(maxTextWidth, textWidth);
        });

        doc.setLineWidth(0.1);
        doc.rect(posicionX, posicionY - alturaFila, maxTextWidth, alturaFila, 'S');
        doc.text(columna, posicionX, posicionY - 5, { align: 'center' });
        posicionX += maxTextWidth;
      });
    };

    calcularAnchoColumnas();

    posicionX = margenIzquierdo;
    posicionY += alturaFila;

    filas.forEach((fila) => {
      fila.forEach((dato, index) => {
        const textWidth = getTextWidth(dato);
        doc.setLineWidth(0.1);
        doc.rect(posicionX, posicionY - alturaFila, textWidth, alturaFila, 'S');
        doc.text(dato, posicionX, posicionY - 5, { align: 'center' });
        posicionX += textWidth;
      });

      posicionX = margenIzquierdo;
      posicionY += alturaFila + espacioEntreFilas;
    });

    doc.save('reporte.pdf');
  
     
  }

}
