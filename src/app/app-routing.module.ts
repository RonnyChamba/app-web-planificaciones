import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AdminComponent } from './modules/admin/page/admin/admin.component';
import { CourseComponent } from './modules/admin/page/course/course.component';
import { ReviewComponent } from './modules/admin/page/review/review.component';
import { TeacherComponent } from './modules/teacher/page/teacher/teacher.component';
import { ProfileComponent } from './modules/profile/page/profile.component';
import { InformationComponent } from './modules/information/page/information.component';
import { GuardAccessGuard } from './guards/guard-access.guard';
import { GuardLoginGuard } from './guards/guard-login.guard';
import { PeriodoComponent } from './modules/periodo/page/periodo/periodo.component';

const routes: Routes = [

  {
    path: "auth", component: LoginComponent,
    title: 'Planificaciones | Login',
    canActivate: [GuardLoginGuard]
  },
  {
    path: "docentes", component: TeacherComponent,
    title: 'Planificaciones | Docentes ',
    canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin'] }
  },
  {
    path: "course/:uid", component: CourseComponent,
    title: 'Planificaciones | Curso ', canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin', 'user'] }
  },
  {
    path: "planification/:uid", component: ReviewComponent,
    title: 'Planificaciones | Revisar',
    canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin'] }
  },

  {
    path: "perfil", component: ProfileComponent,
    title: 'Planificaciones | Perfil',
    canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin', 'user'] }

  },
  {
    path: "periodos", component: PeriodoComponent,
    title: 'Planificaciones | Periodos ',
    canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin'] }
  },
  {
    path: "informacion", component: InformationComponent,
    title: 'Planificaciones | Informacion',
    canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin', 'user'] }
  },
  {
    path: "", component: AdminComponent,
    title: 'Planificaciones | Home',
    canActivate: [GuardAccessGuard],
    data: { expectedRol: ['admin', 'user'] }
  },

  { path: "**", redirectTo: "auth" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
