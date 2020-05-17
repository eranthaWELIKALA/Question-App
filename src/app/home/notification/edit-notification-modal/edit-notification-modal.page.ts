import { Component, OnInit, Input } from '@angular/core';
import { faAsterisk, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Notification, NotificationService } from "../notification.service";
import { ModalController } from '@ionic/angular';
import { User, UserService } from 'src/app/initial/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-notification-modal',
  templateUrl: './edit-notification-modal.page.html',
  styleUrls: ['./edit-notification-modal.page.scss'],
})
export class EditNotificationModalPage implements OnInit {

  faAsterisk = faAsterisk;
  faTimes = faTimes;

  public disableSaveBtn: boolean = false;
  
  private users: {id: string, data: User}[] = [];
  public usersFormatted: {id: string, name: string}[] = [];

  public userRoleS: boolean = false;

  private userSubscription: Subscription;

  @Input("notification") notification: {id: string, data: Notification};

  constructor(
    private toastMessageService: ToastMessageService,
    private notificationService: NotificationService,
    private userService: UserService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log(this.notification);
    this.userSubscription = this.userService.getUsers().subscribe(res=>{
      this.users = res;
      this.users.forEach(el=>{
        this.usersFormatted.push({id: el.id, name: el.data.firstname + " " + el.data.lastname});
      })

    });
  }

  public formSubmit(){
    console.log("___formSubmit()___");
    if(this.notification.data.title == "" || this.notification.data.description == "" || this.notification.data.userRoleSelection == ""){
      this.toastMessageService.showToastMessage("Please fill-out all the feilds with stars");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }
    if(this.notification.data.userSelection && this.notification.data.selectedUsers == ""){
      this.toastMessageService.showToastMessage("Please fill-out all the feilds with stars");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }

    // Create notification
    this.notificationService.updateNotification(this.notification.id, this.notification.data).then(doc=>{
      console.log(doc);
      this.modalController.dismiss();
    })
  }

  public close(){
    this.modalController.dismiss();
  }

}
