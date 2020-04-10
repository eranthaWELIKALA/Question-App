import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/initial/user.service';

export interface Notification{
  title: string;
  description: string;
  userRoleSelection: string;
  userSelection: boolean;
  selectedUsers: string;
  clearedUsers: string;
  createdUser: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationCollection: AngularFirestoreCollection<Notification>;  
  private notifications: Observable<{id: string, data: Notification}[]>;
  private notificationList: {id: string, data: Notification}[];

  constructor(private db: AngularFirestore) {
    this.notificationCollection = db.collection<Notification>('notifications');
   }

   getNotifications(): Observable<{id: string, data: Notification}[]> {
    this.notifications = this.notificationCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.notifications;
  }

  addNotification(notification: Notification) {
    return this.notificationCollection.add(notification);
  }

  async getNotificationForMe(user: {id: string, data:User}){
    this.notificationList = [];
    await this.notificationCollection.ref.get().then(querySnapshot=>{
      querySnapshot.forEach(el=>{
        let data = el.data();
        console.log(data);
        if(data.createdUser==user.id){
          this.copyToArrayIfNotBlocked(user.id, el);
        }
        else if(data.userSelection){
          let filteredUsers: any[] = el.data().selectedUsers;
          let filtered = false;
          filteredUsers.forEach(element => {
            element.id == user.id ? filtered = true : '';
          });
          filtered ? this.copyToArrayIfNotBlocked(user.id, el) : '' ;
        }
        else{
          if(data.userRoleSelection=='admin' && user.data.adminFeatures){ 
            this.copyToArrayIfNotBlocked(user.id, el);
          }
          else if(data.userRoleSelection=='instructor' && user.data.role=="instructor"){     
            this.copyToArrayIfNotBlocked(user.id, el);
          }
          else if(data.userRoleSelection=='student' && user.data.role=="student"){ 
            this.copyToArrayIfNotBlocked(user.id, el);
          }
          else{
            this.copyToArrayIfNotBlocked(user.id, el);
          }
        }
      });
    });
    console.log(this.notificationList);
    return this.notificationList;
  }

  copyToArrayIfNotBlocked(userId: string, el: firebase.firestore.QueryDocumentSnapshot){
    let blocked : boolean = false;
    let clearedUsersArray: string = el.data().clearedUsers;
    if(clearedUsersArray != null && clearedUsersArray != undefined){
      if(clearedUsersArray == ""){
        blocked = false;
      }
      else{
        let clearedUsers: string[] = JSON.parse(clearedUsersArray);
        blocked = clearedUsers.includes(userId);
      }
      !blocked ? this.notificationList.push({id: el.id, data: <Notification>el.data()}) : "";
    }
  }

  removeNotification(id) {
    return this.notificationCollection.doc(id).delete();
  }

  clearNotificationForMe(notificationId: string, notification: Notification, userId: string){
    let data: string = notification.clearedUsers;
    let clearedUsers: string[] = [];
    if(data!=""){
      clearedUsers = JSON.parse(data).concat(userId);
    }
    else{
      clearedUsers = clearedUsers.concat(userId);
    }
    let updatedNotification: Notification = notification;
    updatedNotification.clearedUsers = JSON.stringify(clearedUsers);
    return this.notificationCollection.doc(notificationId).update(updatedNotification);
  }

  cleanClearedUsers(notificationId: string, notification: Notification){
    let updatedNotification: Notification = notification;
    updatedNotification.clearedUsers = "";
    return this.notificationCollection.doc(notificationId).update(updatedNotification);
  }

  updateNotification(id: string, notification: Notification){
    return this.notificationCollection.doc(id).update(notification);
  }
}
