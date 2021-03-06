import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { faTimes } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-create-newsfeed',
  templateUrl: './create-newsfeed.page.html',
  styleUrls: ['./create-newsfeed.page.scss'],
})
export class CreateNewsfeedPage implements OnInit {
  
  faTimes = faTimes;

  public disableSaveBtn: boolean = false;

  @Input("description") description: string;

  constructor(
    private modalController: ModalController){}

  ngOnInit() {
  }

  public post(){
    this.modalController.dismiss({
      'description': this.description
    });
  }

  public close(){
    this.modalController.dismiss({
      'description': this.description
    });
  }

}
