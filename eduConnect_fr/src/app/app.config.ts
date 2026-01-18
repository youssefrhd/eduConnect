import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [ provideRouter(routes),provideZoneChangeDetection({ eventCoalescing: true }),provideAnimations(),provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
