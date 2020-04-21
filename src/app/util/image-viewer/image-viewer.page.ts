import { Component, OnInit, Input } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
})
export class ImageViewerPage implements OnInit {

  faTimes = faTimes;

  @Input() image_url: string = "";

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  private close(){
    this.modalController.dismiss();
  }

}
