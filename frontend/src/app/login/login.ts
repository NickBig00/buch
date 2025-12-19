import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  error = false;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔑 WICHTIG: bereits eingeloggt?
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/books']);
    }
  }

  login(): void {
    if (this.auth.isLoggedIn()) {
      // defensive – sollte eigentlich nie passieren
      this.router.navigate(['/books']);
      return;
    }

    this.loading = true;

    this.auth.login().catch(() => {
      this.error = true;
      this.loading = false;
    });
  }
}
