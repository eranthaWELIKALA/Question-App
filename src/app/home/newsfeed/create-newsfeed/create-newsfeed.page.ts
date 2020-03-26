import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { IconService } from 'src/app/util/icon/icon.service';

@Component({
  selector: 'app-create-newsfeed',
  templateUrl: './create-newsfeed.page.html',
  styleUrls: ['./create-newsfeed.page.scss'],
})
export class CreateNewsfeedPage implements OnInit {
  
  faTimes = faTimes;

  private diableSaveBtn: boolean = false;

  @Input("description") description: string;

  constructor(
    private modalController: ModalController){}

  ngOnInit() {
  }

  private post(){
    this.modalController.dismiss({
      'description': this.description
    });
  }

  private close(){
    this.modalController.dismiss({
      'description': this.description
    });
  }

}
