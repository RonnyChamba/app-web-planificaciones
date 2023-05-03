import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModelTeacher } from '../../teacher/models/teacher';
const COLLECTION_NAME = 'teachers';
@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {

  userData: any;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth) { }

  ngOnInit(): void {


    // this.saveCredentialLocalStore();
  }
  // private saveCredentialLocalStore() {

  //   this.afAuth.authState.subscribe(user => {

  //     console.log("aquii sesiosn")
  //     if (user) {

  //       this.userData = user;

  //       localStorage.setItem('user', JSON.stringify(this.userData));
  //       JSON.parse(localStorage.getItem('user') || '{}');


  //     } else {
  //       localStorage.setItem('user', 'null');
  //       JSON.parse(localStorage.getItem('user') || '{}');

  //     }
  //   }
  //   );
  // }

  saveUserData(user: ModelTeacher) {
    return this.afs.doc(`${COLLECTION_NAME}/${user.uid}`).set(user, {
      merge: true
    });
  }

  login(email: string, password: string) {

    return this.afAuth.signInWithEmailAndPassword(email, password)
  }

  async createAccount(email: string, password: string) {

    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email, password as string);

      // Send email verification
      result.user?.sendEmailVerification();

      return result;

    } catch (error: any) {

      throw new Error(error.message);
    }

  }

  getUserCurrent() {
    return this.afAuth.currentUser;
  }

  deleteUser(uid: any){
    
  } 
  logOut() {

    return this.afAuth.signOut();

  }

}
