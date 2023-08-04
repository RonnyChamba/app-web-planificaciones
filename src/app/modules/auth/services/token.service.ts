import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService implements OnInit{

  constructor() { }

  ngOnInit(): void {

  }

  setToken(token: any) {
    localStorage.setItem('user', token);
  }

  getToken() {
    return localStorage.getItem('user');
  }

  verifyToken() {
    return localStorage.getItem('user') ? true : false;
  }
  

  removeToken() {
    localStorage.removeItem('user');
    this.setToken('null');
  }

  setCourse(course: any) {
    localStorage.setItem('course', JSON.stringify(course));
  }

  getCourse() {
    return localStorage.getItem('course');
  }

  setCurrentPeriodo(periodo: any) {
    localStorage.setItem('periodo', JSON.stringify(periodo));
  }

  getCurrentPeriodo() {
    return localStorage.getItem('periodo');
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  isLogged() {
    return localStorage.getItem('user') ? true : false;
  }

  isLoggedAdmin() {
      
    if (this.isLogged()) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // console.log(user)
    return user.rol == 'ADMIN' ? true : false;
    }

    return false;

    }





}
