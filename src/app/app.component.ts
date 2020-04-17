import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from './shared/shared.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ToastMessageService } from './util/toastMessage/toast-message.service';
import { Network } from '@ionic-native/network/ngx';
import { LoadingService } from './util/loading/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  faCoffee = faCoffee;

  constructor(
    private platform: Platform,
    private network: Network,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private toastMessageService: ToastMessageService,
    private loadingService: LoadingService,
    private sharedService: SharedService,
    private androidPermissions: AndroidPermissions
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  ngOnInit(): void {

    if(this.platform.is("cordova")){
      // Waiting for Online-Offline respond
      this.network.onDisconnect().subscribe( async res =>{
        this.toastMessageService.showToastMessage(res.message, 5000);
        await this.loadingService.showNetworkLoading("Connecting to internet", "bubbles");
      });
  
      this.network.onConnect().subscribe( res =>{
        this.loadingService.hideNetworkLoading();
      });


      // Check whether the device is "Android"
      if(this.platform.is("android")){
        // Check for CAMERA permission
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
          result => this.sharedService.CAMERA_PERMISSION = result.hasPermission,
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA).then(res =>{
            this.sharedService.CAMERA_PERMISSION = res.hasPermission
          })
        );

        // Check for READ_EXTERNAL_STORAGE permission
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
          result => this.sharedService.STORAGE_PERMISSION = result.hasPermission,
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(res=>{
            this.sharedService.STORAGE_PERMISSION = res.hasPermission;
          })
        );
      }
    }
   
    // Waiting for Login request respond
    this.sharedService.loginRequestRespond().subscribe(async res=>{
      this.toastMessageService.showToastMessage(res.message, 2000);
    });
    this.sharedService.emailVerifyRequestRespond().subscribe(async res=>{
      this.toastMessageService.showToastMessage(res.message, 2000);
    });
    
  }
}
