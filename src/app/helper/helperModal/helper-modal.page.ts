import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { faTimes, faArrowLeft, faCircle } from '@fortawesome/free-solid-svg-icons';
import { HelperService } from '../helper.service';

@Component({
  selector: 'app-helper-modal',
  templateUrl: './helper-modal.page.html',
  styleUrls: ['./helper-modal.page.scss'],
})
export class HelperModalPage implements OnInit {

  faTimes = faTimes;
  faArrowLeft = faArrowLeft;
  faCircle = faCircle;

  private helpTitle = "Help";

  private helpTitles: any[] = [];
  private helpContent: any;

  private showContentPanel: boolean = false;

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

  private async close(){
    await this.modalController.dismiss();
  }

  

}
