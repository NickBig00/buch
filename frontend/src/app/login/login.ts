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
    // Nach Keycloak-Redirect: Token vorhanden? Dann sofort weiterleiten
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    } else {
      // Keycloak-Callback kann asynchron sein, daher nach kurzer Zeit erneut prüfen
      setTimeout(() => {
        if (this.auth.isLoggedIn()) {
          this.router.navigate(['/home']);
        }
      }, 300);
    }
  }

  async login(): Promise<void> {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }
    this.loading = true;
    try {
      await this.auth.login();
      // Nach Login-Redirect: Token vorhanden? Dann sofort weiterleiten
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/home']);
      }
    } catch {
      this.error = true;
      this.loading = false;
    }
  }
}
