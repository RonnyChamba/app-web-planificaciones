import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModelTeacher } from '../../teacher/models/teacher';
import { Router } from '@angular/router';
import { Observable, of} from 'rxjs';


const COLLECTION_NAME = 'teachers';
@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router) { }

  ngOnInit(): void {
   

    this.saveCredentialLocalStore();
  }
  private saveCredentialLocalStore() {

    this.afAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.setItem('user', 'null');

      }
    }
    );
  }

  saveUserData(user: ModelTeacher) {
    return this.afs.doc(`${COLLECTION_NAME}/${user.uid}`).set(user, {
      merge: true
    });
  }

  login(email: string, password: string) {

    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async register(teacher: ModelTeacher) {

    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        teacher.email, teacher.password as string);

      // Send email verification
        result.user?.sendEmailVerification();

        result.user?.emailVerified

      // Set user data to firestore on login
      const newTeacher: ModelTeacher = {

        uid: result.user?.uid,
        displayName: result.user?.displayName  || teacher.displayName,
        lastName: teacher.lastName,
        emailVerified: result.user?.emailVerified,
        dni: teacher.dni,
        email: result.user?.email as string,
        photoURL: result.user?.photoURL as string,
        phoneNumber: result.user?.phoneNumber || teacher.phoneNumber, 
        titles: teacher.titles,
      }

      await  this.saveUserData(newTeacher);
      this.afAuth.authState.subscribe(user =>{
        if (user) {
          // navigate to home page
          this.router.navigate(['/']);
          // return of(user);
          

        }
      })
    } catch (error: any) {

      throw new Error(error.message);
    }


  }
}
