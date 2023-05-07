import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AdminComponent } from './modules/admin/page/admin/admin.component';
import { CourseComponent } from './modules/admin/page/course/course.component';
import { ReviewComponent } from './modules/admin/page/review/review.component';
import { TeacherComponent } from './modules/teacher/page/teacher/teacher.component';
import { ProfileComponent } from './modules/profile/page/profile.component';

const routes: Routes = [
  {path: "auth",component: LoginComponent},
  {path: "docentes",component: TeacherComponent},
  {path: "course/:uid",component: CourseComponent},
  {path: "planification/:uid",component: ReviewComponent},
  {path: "perfil",component: ProfileComponent},
  {path: "",component: AdminComponent},

  {path: "**", redirectTo: "auth"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
