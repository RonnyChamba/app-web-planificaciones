import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './modules/teacher/components/register/register.component';
import { HttpClientModule } from '@angular/common/http'; 
import { environment } from 'src/environments/environment';

// FIREBASE
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
// module by auth
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { ToastrModule } from 'ngx-toastr';
import { FormCourseComponent } from './modules/admin/components/form-course/form-course.component';
import { FormPlanificationComponent } from './modules/admin/components/form-planification/form-planification.component';
import { AdminComponent } from './modules/admin/page/admin/admin.component';
import { NavbaComponent } from './components/navba/navba.component';
import { ListCourseComponent } from './modules/admin/components/list-course/list-course.component';
import { CourseComponent } from './modules/admin/page/course/course.component';
import { DetailsCourseComponent } from './modules/admin/components/details-course/details-course.component';
import { FormatDatePipe, TrimText } from './modules/pipes/format-date.pipe';
import { WeekComponent } from './modules/admin/components/week/week.component';
import { DetailPlanificationComponent } from './modules/admin/components/detail-planification/detail-planification.component';
import { ReviewComponent } from './modules/admin/page/review/review.component';
import { ListWeekComponent } from './modules/admin/components/list-week/list-week.component';
import { HeaderComponent } from './modules/admin/components/details-course/components/header/header.component';
import { DetailsTeacherComponent } from './modules/admin/components/details-course/components/details-teacher/details-teacher.component';
import { ListPlanificationComponent } from './modules/admin/components/details-course/components/list-planification/list-planification.component';
import { ReviewListComponent } from './modules/admin/components/review-list/review-list.component';
import { ReviewNoteComponent } from './modules/admin/components/review-note/review-note.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TeacherComponent } from './modules/teacher/page/teacher/teacher.component';
import { ListTeacherComponent } from './modules/teacher/components/list-teacher/list-teacher.component';
import { ResetPasswordComponent } from './modules/auth/components/reset-password/reset-password.component';
import { SelectTeacherComponent } from './modules/admin/components/details-course/components/select-teacher/select-teacher.component';
import { ProfileComponent } from './modules/profile/page/profile.component';
import { PersonalInfoComponent } from './modules/profile/components/personal-info/personal-info.component';
import { InformationComponent } from './modules/information/page/information.component';
import { ChangePasswordComponent } from './modules/auth/components/change-password/change-password.component';
import { ViewDetailComponent } from './modules/admin/components/details-course/components/view-detail/view-detail.component';
import { RegisterPeriodosComponent } from './modules/periodo/components/register-periodos/register-periodos.component';
import { ListPeriodosComponent } from './modules/periodo/components/list-periodos/list-periodos.component';
import { PeriodoComponent } from './modules/periodo/page/periodo/periodo.component';
import { ListPlaniTeacherComponent } from './modules/admin/components/list-plani-teacher/list-plani-teacher.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    FormCourseComponent,
    FormPlanificationComponent,
    AdminComponent,
    NavbaComponent,
    ListCourseComponent,
    CourseComponent,
    DetailsCourseComponent,
    FormatDatePipe,
    TrimText,
    WeekComponent,
    DetailPlanificationComponent,
    ReviewComponent,
    ListWeekComponent,
    HeaderComponent,
    DetailsTeacherComponent,
    ListPlanificationComponent,
    ReviewListComponent,
    ReviewNoteComponent,
    SidebarComponent,
    TeacherComponent,
    ListTeacherComponent,
    ResetPasswordComponent,
    SelectTeacherComponent,
    ProfileComponent,
    PersonalInfoComponent,
    InformationComponent,
    ChangePasswordComponent,
    ViewDetailComponent,
    RegisterPeriodosComponent,
    ListPeriodosComponent,
    PeriodoComponent,
    ListPlaniTeacherComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule, HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ToastrModule.forRoot(), // ToastrModule added
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
