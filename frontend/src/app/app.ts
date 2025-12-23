import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.auth.init(); // läuft NUR im Browser
    if (this.auth.isLoggedIn() && this.router.url === '/login') {
      this.router.navigate(['/home']);
    }
  }
}
