import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-agreement-modal',
  templateUrl: './agreement-modal.page.html',
  styleUrls: ['./agreement-modal.page.scss'],
})
export class AgreementModalPage implements OnInit {

  faTimes = faTimes;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  public async close(){
    await this.modalController.dismiss();
  }

}
