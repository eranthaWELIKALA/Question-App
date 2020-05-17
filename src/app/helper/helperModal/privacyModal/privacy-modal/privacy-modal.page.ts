import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.page.html',
  styleUrls: ['./privacy-modal.page.scss'],
})
export class PrivacyModalPage implements OnInit {

  faTimes = faTimes;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  public async close(){
    await this.modalController.dismiss();
  }

}
