import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak?: Keycloak;
  private initialized = false;
  private initPromise?: Promise<void>;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });

      await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        redirectUri: window.location.href,
      });

      this.initialized = true;
    })();

    return this.initPromise;
  }

  login(): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }

    return this.keycloak.login({ redirectUri: window.location.origin + '/home' });
  }

  logout() {
    return this.keycloak?.logout({ redirectUri: window.location.origin + '/login' });
  }

  isLoggedIn(): boolean {
    return !!this.keycloak?.token;
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }
}
