import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
class OutAuthGuard {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    var token = this.authService.getToken();
    if (token == null) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
class OnAuthGuard {
  constructor(private authService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = this.authService.getToken();
    if (token != null) {
      return true;
    } else {
      return false;
    }
  }
}

export { OnAuthGuard, OutAuthGuard };
