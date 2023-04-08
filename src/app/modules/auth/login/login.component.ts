import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  implements  OnInit{


  formGroup: FormGroup;

  constructor() { }

  ngOnInit(): void {

    this.createForm();
  
}

createForm() {
  this.formGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  
}


  onSubmit() {
    console.log(this.formGroup.value);
  }

}
