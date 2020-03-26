import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastMessageService {

  constructor(private toastController: ToastController) { }

  public async showToastMessage(message: string, duration: number=2000, position: string="bottom"){
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: "primary",
      position: position=="bottom"? "bottom": position=="top"? "top": "middle"
    });
    toast.present();
  }
  
}
