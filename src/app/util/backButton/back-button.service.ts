import { Injectable, Output, EventEmitter } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {

  private count: number = 0;
  private timer: number = 1000;

  constructor(
    private alertController: AlertController
  ) { }

  private setBackButtonPressRequest(){
    this.count++;
    if(this.count==1){
      this.setTimer();
    }
    else if(this.count==2){
      this.count = 0;
      this.appExit();
    }
    else{
      this.count = 0;
    }
  }
  
  private setTimer(){
    setTimeout(async x => 
      {
        this.count = 0;
      }, this.timer);
  }

  private async appExit(){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Quit?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Continue');
            navigator['app'].exitApp();
          }
        }
      ]
    });
    alert.present();
  }
}
