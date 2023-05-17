import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../modules/auth/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class GuardLoginGuard implements CanActivate {

  constructor(

    private tokenService: TokenService,
    private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (this.tokenService.isLogged()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }

}
