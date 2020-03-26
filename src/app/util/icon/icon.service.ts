import { Injectable } from '@angular/core';
import * as icons from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  private iconList = icons;

  constructor() { }

  public getIconList(){
    return this.iconList;
  }
  
}
