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

}
