import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../initial/user.service';
import { SharedService } from '../shared/shared.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PrivacyGuardService implements CanActivate{

  constructor(private sharedService: SharedService, private navController: NavController) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    let loggedInUser: {id: string, data: User} = this.sharedService.getLoggedInUser();

    console.log(route);

    let authInfo = {
        instructor: loggedInUser.data.role == 'i'? true: false
    };

    if (authInfo.instructor) {      
      console.log("You are an instructor");
      return true;
    }
    else{
      console.log("You are a student");
      this.navController.navigateRoot("home/newsfeed");
      return false;
    }
  }
}
