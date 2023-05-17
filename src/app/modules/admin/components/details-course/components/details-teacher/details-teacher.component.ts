import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CourseFullModel } from 'src/app/modules/admin/models/course.model';
import { TokenService } from 'src/app/modules/auth/services/token.service';
import { RegisterService } from 'src/app/modules/teacher/services/register.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details-teacher',
  templateUrl: './details-teacher.component.html',
  styleUrls: ['./details-teacher.component.scss']
})
export class DetailsTeacherComponent {

  @Input() courseFullModel: CourseFullModel;
  
  isAdmin: boolean = false;

  constructor(
    private registerService: RegisterService,
    private toaster: ToastrService,
    private tokenService: TokenService,
  ) {
      
      this.isAdmin = this.tokenService.isLoggedAdmin();
   }

  async leftTeacher(uid: any) {

    try {


      Swal.fire({
        title: '¿Estas seguro?',
        text: `Estas seguro de retirar al docente del curso`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',

        confirmButtonText: `Si, retirar`,
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {

        if (result.isConfirmed) {

          await this.registerService.updateRemoveCoursesTeacher(uid, this.courseFullModel.uid);
          this.toaster.info('Docente retirado del curso correctamente');
        }
      });

    } catch (error) {

      console.log(error);
      this.toaster.error('Error al retitar el docente del curso');

    }

    // this.registerService.updateRemoveCoursesTeacher(uid, this.courseFullModel.uid).then(() => {




  }
}
