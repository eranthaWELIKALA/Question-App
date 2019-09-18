import { Component, OnInit } from '@angular/core';
import { faCheck, faGraduationCap, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { User, UserService, Subject } from 'src/app/user.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  faGraduationCap = faGraduationCap;
  faCheck = faCheck;
  faChalkboardTeacher = faChalkboardTeacher;

  private confirmPassword: string;
  private subject: Subject = {
    name: ""
  }
  private user: User = {
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    units: "",
    role: "",
    password: ""
  };
  private subjects: {id: string, data: Subject}[];
  private no_subjects: number;

  constructor(private loadingController: LoadingController, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.userService.getSubjects().subscribe(async res => {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      this.subjects = res;
      console.log(res);
      this.no_subjects = this.subjects.length;
      loading.dismiss();
    },
    error => {
      console.log(error);
    });
  }

  private register(form: any){
    console.log(JSON.stringify(form.value));

    // Exit if validation is falied
    if(!(this.formValidation() && this.passwordValidation() && this.emailValidation())){
      console.log("Validation failed");
      return;
    }
    console.log("Validated");
    this.user.units = JSON.stringify(this.subject);
    if(this.userService.addUser(this.user)){
      this.router.navigateByUrl("/home");
    }

  }

  private formValidation(): boolean{
    if(this.user.firstname == "" || this.user.firstname == null || this.user.firstname == undefined){
      return false;
    }
    if(this.user.lastname == "" || this.user.lastname == null || this.user.lastname == undefined){
      return false;
    }
    if(this.user.email == "" || this.user.email == null || this.user.email == undefined){
      return false;
    }
    if(this.user.role == "" || this.user.role == null || this.user.role == undefined){
      return false;
    }
    if(this.user.username == "" || this.user.username == null || this.user.username == undefined){
      return false;
    }
    if(this.user.password == "" || this.user.password == null || this.user.password == undefined){
      return false;
    }
    return true;
  }

  private passwordValidation(): boolean{
    if(this.user.password!= undefined && this.confirmPassword!= undefined){
      if(this.confirmPassword==this.user.password && this.user.password!='' && this.user.password.length >= 8){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }    
  }

  private emailValidation(): boolean{
    if(this.user.email.includes("@") && this.user.email.includes(".")){
      return true;
    }
    else return false;
  }

  private generateUsername() {
    // Concatenating firstname and lastname then removing whitespaces
    this.user.username = (this.user.firstname.toLowerCase() + this.user.lastname.toLowerCase()).replace(/\s/g,"");
  }

}
