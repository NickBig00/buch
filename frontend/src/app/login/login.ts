import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  error = false;

  login() {
    // Keycloak kommt später
    console.log('Login geklickt');
  }
}
