import { Component } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { faFileAlt, faPlusCircle, faEye, faTrash, faSignOutAlt, faUser, faStickyNote, faFileMedical, faQuestionCircle, faCog, faRss, faBell, faEdit, faCogs } from '@fortawesome/free-solid-svg-icons';
import { User } from '../initial/user.service';
import { AlertController, NavController, Platform, ModalController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HelperModalPage } from '../helper/helperModal/helper-modal.page';
import { NotificationService } from './notification/notification.service';
import { LoadingService } from '../util/loading/loading.service';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.css'],
})
export class HomePage {

  icon: any = {"faFileAlt": faFileAlt ,"faPlusCircle": faPlusCircle, "faEye": faEye, "faTrash": faTrash, "faRss": faRss, "faEdit": faEdit, "faCogs": faCogs,
   "faSignOutAlt": faSignOutAlt, "faUser": faUser, "faStickyNote": faStickyNote, "faFileMedical": faFileMedical, "faQuestionCircle": faQuestionCircle, "faCog": faCog, "faBell": faBell};

  public questionGroup: Array<any> = [];
  public loggedInUser: {id: string, data: User};
  
  constructor(
    public sharedService: SharedService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private alertController: AlertController,
    private nativeStorage: NativeStorage,
    private navController: NavController,
    private fAuth: AngularFireAuth,
    private modalController: ModalController,
    private platform: Platform){
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();
    }

  async ngOnInit() {
    await this.loadingService.showLoading("Loading");
    await this.notificationService.getNotificationForMe(this.loggedInUser).then(doc=>{
      this.sharedService.setNotificationCount(doc.length);
    });
    this.loadingService.hideLoading();    
  }

  public async showHelper(){
    const modal = await this.modalController.create({
      component: HelperModalPage,
      cssClass: "my-helper-modal-css",
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {
    })
    return await modal.present();
  }

  public async logOut(){
    if(this.platform.is("cordova")){
      await this.nativeStorage.getItem('rememberedUser').then(
        data => {  
          if(data.email == this.loggedInUser.data.email){
            this.nativeStorage.setItem('rememberedUser', {email: data.email, password: data.password, loggedIn: false})
            .then(() => console.log('Updated item!'),
            error => console.error('Error storing item', error));
          }
        },
        error => console.error(error)
      );
    }
    this.fAuth.auth.signOut();
    this.sharedService.setLoggedInUser(undefined);
    this.navController.navigateRoot('/');
  }

  public async displayAlert(){
      const alert = await this.alertController.create({
        message: "Please finish your paper",
        buttons: ['CLOSE']
      });
  
      await alert.present();
  }
}
