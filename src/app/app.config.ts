import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideAnimations } from '@angular/platform-browser/animations';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

import { routes } from './app.routes';
import { MessageService } from 'primeng/api';
import { requestInterceptor } from './interceptors/request.interceptor';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '{violet.500}',
      600: '{violet.600}',
      700: '{violet.700}',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}'
    },
    // colorschemes: {
    //   light: {
    //     surface: {
    //       0: '#ffffff',
    //       50: '{zinc.50}',
    //       100: '{zinc.100}',
    //       200: '{zinc.200}',
    //       300: '{zinc.300}',
    //       400: '{zinc.400}',
    //       500: '{zinc.500}',
    //       600: '{zinc.600}',
    //       700: '{zinc.700}',
    //       800: '{zinc.800}',
    //       900: '{zinc.900}',
    //       950: '{zinc.950}'
    //     }
    //   }, 
    //   dark: {
    //     surface: {
    //       0: '#ffffff',
    //       50: '{violet.50}',
    //       100: '{violet.100}',
    //       200: '{violet.200}',
    //       300: '{violet.300}',
    //       400: '{violet.400}',
    //       500: '{violet.500}',
    //       600: '{violet.600}',
    //       700: '{violet.700}',
    //       800: '{violet.800}',
    //       900: '{violet.900}',
    //       950: '{violet.950}'
    //     }
    //   }
    // }
  }
})

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([requestInterceptor])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    }),
    MessageService
  ],
};

