import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModelTeacher } from '../../teacher/models/teacher';
const COLLECTION_NAME = 'teachers';
@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth) { }

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

    async createAccount(email: string, password: string) {

    try {
      const result =  await this.afAuth.createUserWithEmailAndPassword(
        email, password as string);

      // Send email verification
        result.user?.sendEmailVerification();

        return result;

    } catch (error: any) {

      throw new Error(error.message);
    }


  }
}
