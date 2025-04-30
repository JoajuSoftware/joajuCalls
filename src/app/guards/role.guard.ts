import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const requiredRole = route.data['requiredRole'];

  if (!userData) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userData.perfil)) {
        router.navigate(['/loginAgent']);
        return false;
      }
    }
    else if (userData.perfil !== requiredRole) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
