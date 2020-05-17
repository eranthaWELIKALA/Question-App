import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.page.html',
  styleUrls: ['./keyboard.page.css'],
})
export class KeyboardPage implements OnInit {

  @Input() text: string = "";
  private txt: any = "";

  faTimes = faTimes;
  faSave = faSave; 
  constructor(private modalController: ModalController) {
   }

  ngOnInit() {
  }  

  public add(){
    console.log(this.text)
    this.modalController.dismiss({
      'text': this.text
    });
  }

  public close(){
    this.modalController.dismiss({
      'text': undefined
    })
  }

}
