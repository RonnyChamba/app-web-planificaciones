import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/teacher/components/register/register.component';
import { FormCourseComponent } from './modules/admin/components/form-course/form-course.component';
import { FormPlanificationComponent } from './modules/admin/components/form-planification/form-planification.component';

const routes: Routes = [
  {path: "auth",component: LoginComponent},
  {path: "teacher",component: RegisterComponent},
  {path: "course",component: FormCourseComponent},
  {path: "planification",component: FormPlanificationComponent},
  {path: "**", redirectTo: "auth"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
