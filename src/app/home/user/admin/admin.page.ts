import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, UserService, Subject } from 'src/app/initial/user.service';
import { AlertController, NavController, Platform, ModalController } from '@ionic/angular';
import { faBars, faPlusSquare, faArrowLeft,faCaretSquareUp, faCaretSquareDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared/shared.service';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/util/loading/loading.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.css'],
})
export class AdminPage implements OnInit, OnDestroy {

  faBars = faBars;
  faPlusSquare = faPlusSquare;
  faArrowLeft = faArrowLeft;
  faCaretSquareUp = faCaretSquareUp;
  faCaretSquareDown= faCaretSquareDown;
  faInfoCircle = faInfoCircle;

  public subject: string;

  public subjectShow: boolean = false;
  public adminShow: boolean = false;
  public upgrade: boolean = true;

  public loggedInUser: {id: string, data: User};

  public users: { id: string, data: User}[];
  public admins: { id: string, data: User}[];
  private allUsers: { id: string, data: User}[];
  public allSubjects: { id: string, data: Subject}[];

  private backButtonSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private navController: NavController,
    private userService: UserService,
    private loadingService: LoadingService,
    public sharedService: SharedService,
    private alertController: AlertController,
    private platform: Platform
  ) { 
    this.loggedInUser = this.sharedService.getLoggedInUser();
  }

  ngOnInit() {
    this.loadData(true);   
    this.backButtonSubscription = this.platform.backButton.subscribe(async ()=>{
      this.goBack();
    });
  }

  ngOnDestroy(){
    this.backButtonSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private async loadData(initialLoad: boolean){  
    await this.loadingService.showLoading("Loading");
    this.allUsers = this.userService.getInstructorsNotAdmins();
    this.admins = this.userService.getAdmins();
    !initialLoad ? this.userSubscription.unsubscribe() : '';
    this.userSubscription = this.userService.getSubjects().subscribe(res=>{
      this.allSubjects = res;
    }); 
    this.initializeItems();
    this.loadingService.hideLoading();
  }

  private reload(){
    
  }

  private initializeItems(){
    this.users = this.allUsers;
  }

  public goBack(){
    this.navController.back();
  }

  public filterUsers(evt) {
    this.initializeItems();
  
    const searchTerm = evt.srcElement.value;
  
    if (!searchTerm) {
      return;
    }
  
    this.users = this.users.filter(user => {
      if (searchTerm) {
        if (user.data.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          if(user.data.adminFeatures){
            return false;
          }
          return true;
        }
        else if (user.data.lastname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          if(user.data.adminFeatures){
            return false;
          }
          return true;
        }
        else if (user.data.email.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          if(user.data.adminFeatures){
            return false;
          }
          return true;
        }
        return false;
      }
    });
  }

  public filterAdmins(evt) {
    this.initializeItems();
  
    const searchTerm = evt.srcElement.value;
  
    if (!searchTerm) {
      return;
    }
  
    this.admins = this.admins.filter(admin => {
      if (searchTerm) {
        if (admin.data.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          if(admin.data.adminFeatures){
            return false;
          }
          return true;
        }
        else if (admin.data.lastname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          if(admin.data.adminFeatures){
            return false;
          }
          return true;
        }
        else if (admin.data.email.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          if(admin.data.adminFeatures){
            return false;
          }
          return true;
        }
        return false;
      }
    });
  }

  public async upgradeUser(user: { id: string, data: User}){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Are you sure you want to make ' + user.data.firstname + ' ' + user.data.lastname + ' as an ADMIN?',
      message: 'This might be irreversible!!!',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
            user.data.adminFeatures = false;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Continue');
            user.data.adminFeatures = true;
            this.userService.updateUser(user.data, user.id);
            this.loadData(false);
          }
        }
      ]
    });
    alert.present();
  }

  public async degradeAdmin(admin: { id: string, data: User}){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Are you sure you want to degrade ' + admin.data.firstname + ' ' + admin.data.lastname + ' from ADMIN title?',
      message: 'This might be irreversible!!!',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
            admin.data.adminFeatures = true;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Continue');
            admin.data.adminFeatures = false;
            this.userService.updateUser(admin.data, admin.id);
            this.loadData(false);
          }
        }
      ]
    });
    alert.present();
  }

  public panelHandling(panel: string){
    if(panel=="subject"){
      this.subjectShow = !this.subjectShow;
      this.adminShow? this.adminShow = false: '';
    }
    else{
      this.adminShow = !this.adminShow;
      this.subjectShow? this.subjectShow = false: '';
    }
  }

  public async add_Subject(){
    let duplicate = false;
    await this.loadingService.showLoading("Adding")
    this.allSubjects.forEach(el=>{
      el.data.name == this.subject? duplicate = true: ''
    });
    if(!duplicate){
      let subjectModel: Subject = {
        name: this.subject
      }
      await this.userService.addSubject(subjectModel).then(doc =>{
        doc.id != null ? this.subject = undefined : ''     
      });
    }
  }

  public async removeSubject(subject: {id: string, data: Subject}){
    await this.loadingService.showLoading("Removing")
    this.userService.removeSubject(subject.id);
  }

  public async openHelpModal(){
    let alert = await this.alertController.create({
      header: 'Help',
      subHeader: 'Do you want to degrade an Admin?',
      message: 'Contact with mTute.lk through you registered email address.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Close',
          handler: () => {
            console.log('Close');
          }
        }
      ]
    });
    alert.present();
  }

}
