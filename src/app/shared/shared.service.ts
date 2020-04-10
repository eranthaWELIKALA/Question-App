import { Injectable, EventEmitter, Output } from '@angular/core';
import { User } from '../initial/user.service';
import { MenuController, NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private loggedInUser: {id: string, data:User};

  private onPaper: boolean = false;

  private remoteUserID: string = "vhW15gAUqTYAw0VjZ2HD";

  private studentPicPath: string = "profilePictures/1569192075365_Student.jpg";
  private studentPicUrl: string = "https://firebasestorage.googleapis.com/v0/b/questionapp-42922.appspot.com/o/profilePictures%2F1569192075365_Student.jpg?alt=media&token=da1c6f92-49a2-4e8b-a359-0979995f4d76";

  private teacherPicPath: string = "profilePictures/1569192345051_Teacher.jpg";
  private teacherPicUrl: string = "https://firebasestorage.googleapis.com/v0/b/questionapp-42922.appspot.com/o/profilePictures%2F1569192345051_Teacher.jpg?alt=media&token=bd4dbe94-2d14-4f37-bde6-0e9b597fbac5";

  private notificationCount: number = 0;
  
  public STORAGE_PERMISSION: boolean = false;
  public CAMERA_PERMISSION: boolean = false;

  @Output() loginRequest: EventEmitter<any> = new EventEmitter();
  @Output() emailVerifyRequest: EventEmitter<any> = new EventEmitter();

  constructor(
    private navController: NavController,     
    private menuController: MenuController,) { }
    
  public getRemoteUserID(){
    return this.remoteUserID;
  }

  public setNotificationCount(count: number){
    this.notificationCount = count;
  }

  public getNotificationCount(){
    return this.notificationCount;
  }

  public getLoggedInUser(): {id: string, data:User}{
    return this.loggedInUser;
  }

  public setLoggedInUser(user: {id: string, data:User}) {
    this.loggedInUser = user;
  }

  public getOnPaper(): boolean{
    return this.onPaper;
  }

  public setOnPaper(status: boolean){
    this.onPaper = status;
  }

  public emailVerifyRequestRequest() {
    this.emailVerifyRequest.emit({
      message: "Verify your email before login"
    });
  }

  public emailVerifyRequestRespond() {
    return this.emailVerifyRequest;
  }

  public loginRequestRequest(){
    this.navController.navigateRoot("/");
    this.loginRequest.emit({
      message: "Please login before continue"
    });
  }

  public loginRequestRespond(){
    return this.loginRequest;
  }

  public getStudentPic(): {path: string, url: string}{
    return {path: this.studentPicPath, url: this.studentPicUrl};
  }

  public getTeacherPic(): {path: string, url: string}{
    return {path: this.teacherPicPath, url: this.teacherPicUrl};
  }

  public timeStampToDate(timestamp: firebase.firestore.Timestamp){
    return timestamp!=undefined?timestamp.toDate().toDateString():"";
  }

  private toggleMenu(){
    console.log("___toggleMenu___");
    this.menuController.toggle("mainMenu");
  }

}
