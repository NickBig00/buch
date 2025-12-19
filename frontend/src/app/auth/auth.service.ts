import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak?: Keycloak;
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {

      return;
    }

    if (this.initialized) {
      return;
    }

    this.keycloak = new Keycloak({
      url: 'http://localhost:8880',
      realm: 'nest',
      clientId: 'buch-frontend',
    });

    await this.keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    this.initialized = true;
  }

  login(): Promise<void> {
  if (!this.keycloak) {
    return Promise.reject('Keycloak not initialized');
  }
  return this.keycloak.login();
  }

  logout() {
    return this.keycloak?.logout({ redirectUri: 'http://localhost:4200' });
  }

  isLoggedIn(): boolean {
    return !!this.keycloak?.token;
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }
}
