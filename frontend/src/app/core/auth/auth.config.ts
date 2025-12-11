import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/buch-realm',
  redirectUri: window.location.origin,
  clientId: 'buch-frontend',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
};
