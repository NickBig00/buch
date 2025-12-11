import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './core/auth/auth.config';
import { APP_INITIALIZER, NgModule } from '@angular/core';

export function initAuth(oauth: OAuthService) {
  return () => {
    oauth.configure(authConfig);
    return oauth.loadDiscoveryDocumentAndTryLogin();
  };
}

@NgModule({
  // ...
  imports: [
    // ...
    OAuthModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [OAuthService],
      multi: true,
    },
  ],
})
export class AppModule {}
