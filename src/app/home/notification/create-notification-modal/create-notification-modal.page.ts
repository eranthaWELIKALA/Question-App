import { Component, OnInit } from '@angular/core';
import { User, UserService } from 'src/app/initial/user.service';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../notification.service';
import { faAsterisk, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { ModalController } from '@ionic/angular';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-create-notification-modal',
  templateUrl: './create-notification-modal.page.html',
  styleUrls: ['./create-notification-modal.page.scss'],
})
export class CreateNotificationModalPage implements OnInit {

  faAsterisk = faAsterisk;
  faTimes = faTimes;

  public disableSaveBtn: boolean = false;

  private loggedInUser: {id: string, data: User};

  private users: {id: string, data: User}[] = [];
  public usersFormatted: {id: string, name: string}[] = [];

  public userRoleS: boolean = false;

  public notification: Notification;

  private userSubscription: Subscription;

  constructor(
    private sharedService: SharedService,
    private userService: UserService,
    private notificationService: NotificationService,
    private toastMessageService: ToastMessageService,
    private modalController: ModalController) {
      this.loggedInUser = this.sharedService.getLoggedInUser();
  }

  ngOnInit() {
    this.userSubscription = this.userService.getUsers().subscribe(res=>{
      this.users = res;
      this.users.forEach(el=>{
        this.usersFormatted.push({id: el.id, name: el.data.firstname + " " + el.data.lastname});
      })

    });
    this.createNullNotification();
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }

  private createNullNotification(){
    this.notification = {
      title: "",
      description: "",
      userRoleSelection: "any",
      userSelection: false,
      selectedUsers: "",
      clearedUsers: "",
      createdUser: this.loggedInUser.id
    }
  }

  public formSubmit(){
    console.log("___formSubmit()___");
    if(this.notification.title == "" || this.notification.description == "" || this.notification.userRoleSelection == ""){
      this.toastMessageService.showToastMessage("Please fill-out all the feilds with stars");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }
    if(this.notification.userSelection && this.notification.selectedUsers == ""){
      this.toastMessageService.showToastMessage("Please fill-out all the feilds with stars");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }

    // Create notification
    this.notificationService.addNotification(this.notification).then(doc=>{
      console.log(doc);
      this.modalController.dismiss();
    })
  }

  public close(){
    this.modalController.dismiss();
  }

}
