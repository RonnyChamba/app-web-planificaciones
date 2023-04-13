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
import { FormatDatePipe } from './modules/pipes/format-date.pipe';
import { WeekComponent } from './modules/admin/components/week/week.component';

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
    WeekComponent
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
