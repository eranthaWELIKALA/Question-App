import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { User } from 'src/app/initial/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate {

  constructor(private sharedService: SharedService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    let loggedInUser: {id: string, data: User} = this.sharedService.getLoggedInUser();

    console.log(route);

    let authInfo = {
        adminFeatures: loggedInUser.data.adminFeatures? true: false
    };

    if (authInfo.adminFeatures) {
      console.log("You have admin features");
      return true;
    }
    else{
      console.log("You do not have admin features");
      return false;
    }
  }
}
