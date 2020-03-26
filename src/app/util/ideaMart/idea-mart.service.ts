import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdeaMartService {

  localhostUrl = "http://localhost:7000/";

  private smsUrl = environment.ideaMart_URL + "sms/send";
  private getBalanceUrl = environment.ideaMart_URL + "caas/balance/query";
  private directDebitUrl = environment.ideaMart_URL + "caas/direct/debit";
  private ussdUrl = environment.ideaMart_URL + "ussd/send";

  // private ideaMart = {
  //   "applicationId": "APP_000001",
  //   "password": "password"
  // }

  private ideaMart = {
    "applicationId": environment.ideaMart_APP_ID,
    "password": environment.ideaMart_PASSWORD
  }

  constructor(private http: HttpClient) { }

  sendSMS2BackEnd(){
    var headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Headers", "*");
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json' );
    this.http.get("http://localhost:5000/qapp/ideamart/sms", { headers: headers })
      .subscribe(data => {
        console.log(data);
       }, error => {
        console.log(error);
      });
  }

  sendSMS({ message, telNo = "94771122336" }: { message: string; telNo?: string; }) {
    console.log("___sendSMS()___");
    var headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Headers", "*");
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let postData = {
      "applicationId": this.ideaMart.applicationId,
      "password": this.ideaMart.password,
      "destinationAddresses": ["tel:" + telNo],
      "message": message
      }

    this.http.post(this.smsUrl, postData, { headers: headers })
      .subscribe(data => {
        console.log(data);
       }, error => {
        console.log(error);
      });
  }

  getBalance(): any {
    console.log("___getBalance()___");
    let account;
    var headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Headers", "*");
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json' );

    let postData = {
      "applicationId": this.ideaMart.applicationId,
      "password": this.ideaMart.password,
      "subscriberId": "5C74B588F97",
      "paymentInstrumentName": "",
      "accountId": "",
      "currency": "LKR"
      }

    this.http.post(this.getBalanceUrl, postData, { headers: headers })
      .subscribe(data => {
        console.log(data);
        account = data;
       }, error => {
        console.log(error);
      });

    return account;
  }

  directDebit() {
    console.log("___directDebit()___");
    var headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Headers", "*");
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json' );


    let postData = {
      "applicationId": this.ideaMart.applicationId,
      "password": this.ideaMart.password,
      "externalTrxId": "12345678901234567890123456789012",
      "subscriberId": "5C74B588F97",
      "paymentInstrumentName": "",
      "accountId": "",
      "currency": "LKR",
      "amount": "5"
      }

    this.http.post(this.directDebitUrl, postData, { headers: headers })
      .subscribe(data => {
        console.log(data);
       }, error => {
        console.log(error);
      });
  }

  ussd({ otp, telNo = "94771122336" }: { otp: string; telNo?: string; }) {
    console.log("ussd()___");
    var headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Headers", "*");
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json' );


    let postData = {  
    "applicationId": this.ideaMart.applicationId,
    "password": this.ideaMart.password,
    "version": "1.0",
    "message": "Your OTP for QuestionApp by mtute\n" + otp,
    "ussdOperation": "mo-cont",
    "destinationAddress": "tel:"+telNo
    }

    this.http.post(this.ussdUrl, postData, { headers: headers })
      .subscribe(data => {
        console.log(data);
       }, error => {
        console.log(error);
      });
  }
  

}
