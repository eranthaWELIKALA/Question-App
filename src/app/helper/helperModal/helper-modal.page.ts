import { Component, OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { faTimes, faArrowLeft, faCircle } from '@fortawesome/free-solid-svg-icons';
import { HelperService } from '../helper.service';
import { AgreementModalPage } from './agreementModal/agreement-modal/agreement-modal.page';
import { PrivacyModalPage } from './privacyModal/privacy-modal/privacy-modal.page';

@Component({
  selector: 'app-helper-modal',
  templateUrl: './helper-modal.page.html',
  styleUrls: ['./helper-modal.page.scss'],
})
export class HelperModalPage implements OnInit {

  faTimes = faTimes;
  faArrowLeft = faArrowLeft;
  faCircle = faCircle;

  public helpTitle = "Help";

  public helpTitles: any[] = [];
  public helpContent: any;

  public showContentPanel: boolean = false;

  constructor(
    private helperService: HelperService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.helpTitles = this.helperService.showTitles();
  }

  showContent(helperType: string){
    this.helpContent = this.helperService.showContent(helperType);
    this.helpTitle = this.helpContent.title;    
    this.showContentPanel=!this.showContentPanel;
  }

  goBack(){
    this.helpContent = undefined;
    this.helpTitle = "Help";
    this.showContentPanel=!this.showContentPanel;
  }

  async openAgreementModal(){
    console.log("openAgreementModal()___");
    const modal = await this.modalController.create({
      component: AgreementModalPage,
      cssClass: "my-agreement-modal-css",
      backdropDismiss : false
    });
    return await modal.present();
  }  

  async openPrivacyModal(){
    console.log("openPrivacyModal()___");
    const modal = await this.modalController.create({
      component: PrivacyModalPage,
      cssClass: "my-agreement-modal-css",
      backdropDismiss : false
    });
    return await modal.present();
  }

  public async close(){
    await this.modalController.dismiss();
  }

  

}
