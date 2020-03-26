import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { User } from 'src/app/initial/user.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
})
export class QuestionPage implements OnInit {

  private loggedInUser: {id: string, data: User};

  constructor(private sharedService: SharedService) { 
    // Get Logged in User's details
    this.loggedInUser = this.sharedService.getLoggedInUser();
  }

  ngOnInit() {
  }

}
