import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from './notification.service';
import { SharedService } from 'src/app/shared/shared.service';
import { User } from 'src/app/initial/user.service';
import { faArrowLeft, faBars, faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { NavController, ModalController } from '@ionic/angular';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { CreateNotificationModalPage } from './create-notification-modal/create-notification-modal.page';
import { EditNotificationModalPage } from './edit-notification-modal/edit-notification-modal.page';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  faArrowLeft = faArrowLeft;
  faBars = faBars;
  faPlus = faPlus;
  faTrash = faTrash;
  faEdit = faEdit;

  public disableSaveBtn: boolean = false;

  public notifications: {id: string, data: Notification}[] = [];
  public loggedInUser: {id: string, data: User};

  constructor(
    private notificationService: NotificationService, 
    public sharedService: SharedService,
    private loadingService: LoadingService,
    private modalController: ModalController,
    private navController: NavController) {
    this.loggedInUser = this.sharedService.getLoggedInUser();
   }

  async ngOnInit() {
    await this.loadNotifications();
  }

  goBack(){
    this.navController.back();
  }

  async loadNotifications(){
    await this.loadingService.showLoading("Loading");
    await this.notificationService.getNotificationForMe(this.loggedInUser).then(doc=>{
      this.notifications = doc;
    });
    this.loadingService.hideLoading();
  }

  public async openCreateNotificationModal(){
    console.log("___openCreateNotificationModal()___");
    const modal = await this.modalController.create({
      component: CreateNotificationModalPage,
      cssClass: "my-notification-modal-css",
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {      
    this.disableSaveBtn = !this.disableSaveBtn;
    })
    return await modal.present();
  }

  public async clearForMe(notification: {id: string, data: Notification}){
    console.log("___clearForMe()___");
    await this.loadingService.showLoading("Loading");
    await this.notificationService.clearNotificationForMe(notification.id, notification.data, this.loggedInUser.id); 
    await this.loadNotifications();   
    this.disableSaveBtn=!this.disableSaveBtn;
    this.loadingService.hideLoading();
  }

  public async openEditNotificationModal(notification: {id: string, data: Notification}){
    console.log("___openEditNotificationModal()___");
    const modal = await this.modalController.create({
      component: EditNotificationModalPage,
      cssClass: "my-notification-modal-css",
      backdropDismiss : false,
      componentProps: {
        notification: notification
      }
    });
    modal.onDidDismiss().then(data => {      
    this.disableSaveBtn = !this.disableSaveBtn;
    })
    return await modal.present();
  }

  public async deleteNotification(id: string){
    console.log("___deleteNotification()___");
    await this.loadingService.showLoading("Loading");
    await this.notificationService.removeNotification(id);
    await this.loadNotifications();   
    this.disableSaveBtn = !this.disableSaveBtn;
    this.loadingService.hideLoading();
  }

  public async cleanClearedUsers(notification: {id: string, data: Notification}){
    console.log("___cleanClearedUsers()___");
    await this.loadingService.showLoading("Loading");
    await this.notificationService.cleanClearedUsers(notification.id, notification.data);
    await this.loadNotifications();   
    this.disableSaveBtn = !this.disableSaveBtn;
    this.loadingService.hideLoading();
  }

}
