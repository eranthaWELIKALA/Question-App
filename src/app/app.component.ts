import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
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


    // Check whether the device is "Android"
    if(this.platform.is("android")){

      // Check for READ_EXTERNAL_STORAGE permission
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
        result => this.sharedService.STORAGE_PERMISSION = result.hasPermission,
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(res=>{
          this.sharedService.STORAGE_PERMISSION = res.hasPermission;
        })
      );
    }
  }

  initializeApp() {
    this.platform.ready()
    .then(()=>{
      this.statusBar.styleDefault();
    })
    .then(()=>{
      setTimeout(()=>{
        this.splashScreen.hide();
      }, 1000);
    })
    .catch(()=>{
      this.toastMessageService.showToastMessage("Initializing Failed...");
    });
  }
  
  ngOnInit(): void {

    if(this.platform.is("android")){
      // Waiting for Online-Offline respond
      this.network.onDisconnect().subscribe( async res =>{
        this.toastMessageService.showToastMessage(res.message, 5000);
        await this.loadingService.showNetworkLoading("Connecting to internet", "bubbles");
  
        this.network.onConnect().subscribe(() =>{
          this.loadingService.hideNetworkLoading();
        });
      });
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
