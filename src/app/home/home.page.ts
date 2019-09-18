import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public questionGroup: Array<any> = [];

  constructor(public alertController: AlertController) {
    this.questionGroup = [
    {
      "question" : "What is your name?",
      "answer" : "Erantha"
    },
    {
      "question" : "What is your age?",
      "answer" : "24"
    }]
  }

  private addQuestion(){
    this.createDummyQuestion();
    this.alertGen("Question is added!!!");
    console.log("Question is added!!!");
  }

  private async formSubmit(val){
    console.log(JSON.stringify(val));
    const alert = await this.alertController.create({
      header: "Questions",
      buttons: ['CLOSE']
    });

    await alert.present();
  }

  private createDummyQuestion(){
    let question: Question_Answer= {
      "question": "",
      "answer": ""
    }
    this.questionGroup.push(question);
  }

  private async alertGen(message: any){
    const alert = await this.alertController.create({
      header: 'Alert',
      message: message,
      buttons: ['CLOSE']
    });

    await alert.present();
  }

  /*private changeTab(option: any){
    switch (option){
      case ("add"):{
        this.alertGen("Add Questions");
        break;
      }        
      case "view": {
        this.alertGen("View Questions");
        break;
      }        
      case "delete": {
        this.alertGen("Delete Questions");
        break;
      }
    }         
  }*/

}

export class Question_Answer{
  constructor(    
    question: any,
    answer?: any
  ){}
}
