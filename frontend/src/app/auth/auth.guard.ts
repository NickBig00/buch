import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .init()
    .then(() => (auth.isLoggedIn() ? true : router.createUrlTree(['/login'])))
    .catch(() => router.createUrlTree(['/login']));
};
