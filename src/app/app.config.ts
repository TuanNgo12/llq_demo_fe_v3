import { ApplicationConfig, provideZoneChangeDetection, signal } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTaiga, tuiTextfieldOptionsProvider } from '@taiga-ui/core';
import { authInterceptor } from './interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideTaiga(),
    // Moderate field height app-wide (Taiga defaults to the tall 'l' size).
    tuiTextfieldOptionsProvider({ size: signal('m') }),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
