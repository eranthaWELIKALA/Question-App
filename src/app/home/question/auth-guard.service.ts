import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { User } from 'src/app/initial/user.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  private loggedInUser: {id: string, data: User}

  constructor(private navController: NavController, private sharedService: SharedService) {
    // Get Logged in User's details
    this.loggedInUser = this.sharedService.getLoggedInUser();
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    console.log(route);

    let authInfo = {
        loggedIn: this.loggedInUser != undefined? true: false
    };

    if(authInfo.loggedIn){
      if (this.loggedInUser.data.role != "i") {
        console.log("You are a student");
        return false;
      }
      else{
        console.log("You are an instructor");
        return true;
      }
    }
    else{
      this.navController.navigateRoot('/');
      return false;
    }
  }
}
