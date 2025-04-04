import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { LoginAgentService } from "../pages/callcenter/login-agent/services/login-agent.service";

export const loginAgentGuard: CanActivateFn = (route, state) => {
    const loginAgentService = inject(LoginAgentService);
    const router = inject(Router);

    if (!loginAgentService.isLoginAgentAuth.value) {
        router.navigate(['/loginAgent'], { replaceUrl: true });
        return false;
    }

    return true;
}
