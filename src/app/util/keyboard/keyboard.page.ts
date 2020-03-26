import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import { ModalController } from '@ionic/angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { text } from '@fortawesome/fontawesome-svg-core';

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

  private add(){
    console.log(this.text)
    this.modalController.dismiss({
      'text': this.text
    });
  }

  private close(){
    this.modalController.dismiss({
      'text': undefined
    })
  }

}
