import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/teacher/components/register/register.component';
import { AdminComponent } from './modules/admin/page/admin/admin.component';
import { CourseComponent } from './modules/admin/page/course/course.component';
import { ReviewComponent } from './modules/admin/page/review/review.component';

const routes: Routes = [
  {path: "auth",component: LoginComponent},
  {path: "teacher",component: RegisterComponent},
  {path: "course/:uid",component: CourseComponent},
  // {path: "planification",component: FormPlanificationComponent},
  {path: "planification/:uid",component: ReviewComponent},
  {path: "home",component: AdminComponent},

  {path: "**", redirectTo: "auth"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
