import { Component, OnInit, Input } from '@angular/core';
import { faAsterisk, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Notification, NotificationService } from "../notification.service";
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-notification-modal',
  templateUrl: './edit-notification-modal.page.html',
  styleUrls: ['./edit-notification-modal.page.scss'],
})
export class EditNotificationModalPage implements OnInit {

  faAsterisk = faAsterisk;
  faTimes = faTimes;

  private disableSaveBtn: boolean = false;

  @Input("notification") notification: {id: string, data: Notification};

  constructor(
    private toastMessageService: ToastMessageService,
    private notificationService: NotificationService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log(this.notification);
  }

  private formSubmit(){
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

  private close(){
    this.modalController.dismiss();
  }

}
