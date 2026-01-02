import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule],
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

  async ngOnInit(): Promise<void> {
    await this.auth.init();
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
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
