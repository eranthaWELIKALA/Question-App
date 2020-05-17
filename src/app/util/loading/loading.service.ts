import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loading: any;
  private netLoading: any;
  private status: boolean = false;
  private loaders: number = 0;

  constructor(private loadingController: LoadingController) { }

  public async showNetworkLoading(loadingMessage: string, spinnerType: string = undefined){
    console.log("___showLoading()___");
    this.status = true;
    this.netLoading = await this.loadingController.create({
      message: loadingMessage,
      spinner: spinnerType=="bubbles"? "bubbles": undefined
    });
    await this.netLoading.present();
  }

  public hideNetworkLoading(){
    console.log("___hideLoading()___");
    if(this.netLoading!=undefined){
      this.netLoading.dismiss();
      this.netLoading = undefined;
    }
    else{
      // nothing to do
    }
  }

  public async showLoading(loadingMessage: string, spinnerType: string = undefined){
    this.loaders++;
    if(this.loading != undefined){      
      console.log("___showLoading() - update___");
      this.loading.message = loadingMessage;
    }
    else{
      console.log("___showLoading()___");
      this.status = true;
      this.loading = await this.loadingController.create({
        message: loadingMessage,
        spinner: spinnerType=="bubbles"? "bubbles": undefined
      });
      await this.loading.present();
    }
    console.log(this.loaders);
  }

  public hideLoading(){
    console.log("___hideLoading()___");
    this.loaders--; 
    console.log(this.loaders);
    if(this.loaders < 0){
      this.loaders = 0;
    }   
    if(this.loaders == 0){
      this.loading.dismiss();
      this.loading = undefined;
    }
  }

  
}
