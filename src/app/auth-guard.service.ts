import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { User } from 'src/app/initial/user.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private navController: NavController, private sharedService: SharedService) { 
  }

  ngOnInit(): void {    
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    let loggedInUser: {id: string, data: User} = this.sharedService.getLoggedInUser();

    console.log(route);

    let authInfo = {
        loggedIn: loggedInUser != undefined? true: false
    };

    if(authInfo.loggedIn){
      console.log("LoggedIn User");
      return true;
    }
    else{
      console.log("Not a loggedIn user");
      this.sharedService.loginRequestRequest();
      this.navController.navigateRoot('/');
      return false;
    }
  }
}
