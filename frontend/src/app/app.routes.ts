import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { authGuard } from './auth/auth.guard';
import { HomeComponent } from './home.component';
import { BookCreateComponent } from './books/book-create.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'home', component: HomeComponent, canActivate: [authGuard] },

  { path: 'books/new', component: BookCreateComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' },
];
