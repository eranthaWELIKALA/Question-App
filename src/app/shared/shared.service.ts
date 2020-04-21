import { Injectable, EventEmitter, Output } from '@angular/core';
import { User } from '../initial/user.service';
import { MenuController, NavController } from '@ionic/angular';
import { AdMobFreeBannerConfig } from '@ionic-native/admob-free/ngx';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private loggedInUser: {id: string, data:User};

  private onPaper: boolean = false;

  private remoteUserID: string = "vhW15gAUqTYAw0VjZ2HD";
  
  private studentPicPath: string = "profilePictures/Default/student.jpg";
  private studentPicUrl: string = "https://firebasestorage.googleapis.com/v0/b/mtute-sl.appspot.com/o/profilePictures%2FDefault%2Fstudent.jpg?alt=media&token=f61b56c0-f737-45d4-bfc3-3dba1de9683f";
  
  private teacherPicPath: string = "profilePictures/Default/Instructor.jpg";
  private teacherPicUrl: string = "https://firebasestorage.googleapis.com/v0/b/mtute-sl.appspot.com/o/profilePictures%2FDefault%2FInstructor.jpg?alt=media&token=217f5045-c06a-4ce4-a21b-5efc533171b2";

  private notificationCount: number = 0;
  
  public STORAGE_PERMISSION: boolean = false;
  public CAMERA_PERMISSION: boolean = false;

  //id: 'ca-app-pub-1240535405981859/3878740228'

  private bannerConfig: AdMobFreeBannerConfig = {
    id: 'ca-app-pub-1240535405981859/3878740228',
    autoShow: true,
    isTesting: false,
    bannerAtTop: false,
    overlap: false
  }

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

  public getBannerConfig(){
    return this.bannerConfig;
  }

  public timeStampToDate(timestamp: firebase.firestore.Timestamp){
    return timestamp!=undefined?timestamp.toDate().toDateString():"";
  }

  private toggleMenu(){
    console.log("___toggleMenu___");
    this.menuController.toggle("mainMenu");
  }

}
