import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User{
  role: string;
  adminFeatures: boolean,
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  units: string;
  img_url: string;
  metadata: string;
  grade_level: string;
  
  // User details according to user type
  institute: Institute;
  instructor: Instructor;
  student: Student;
}

export interface Institute{
  
}

export interface Instructor{

}

export interface Student{

}

export interface Subject{
  name?: string;
}

export interface OTP{
  otp?: string;
  status?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersCollection: AngularFirestoreCollection<User>;
  private subjectsCollection: AngularFirestoreCollection<Subject>;
  private otpsCollection: AngularFirestoreCollection<OTP>;

  private users: Observable<{id: string, data: User}[]>;
  private subjects: Observable<{id: string, data: Subject}[]>;
  private otps: Observable<{id: string, data: OTP}[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.usersCollection = db.collection<User>('users');
    this.subjectsCollection = db.collection<Subject>('subjects');
    this.otpsCollection = db.collection<OTP>('otp');
  }

  uploadImage(file: File): {task: AngularFireUploadTask, fileRef: AngularFireStorageReference, path}{
    let fileName = file.name;
    let path = `profilePictures/${new Date().getTime()}_${fileName}`;
    let customMetadata = { app: 'Question App'};
    let fileRef = this.storage.ref(path);

    let uploadedFileURL: string;

    let task = this.storage.upload(path, file, { customMetadata });
    return {task, fileRef, path};
    /*task.then().then(
      res => {
        fileRef.getDownloadURL().subscribe(res => {
          uploadedFileURL = res;
          console.log(uploadedFileURL);
        },
        err => {
          console.log(err);
        })
      });
      console.log(uploadedFileURL);*/
  }

  removeImage(metadata){
    return this.storage.ref(metadata.fullPath).delete();
  }

   // Handling user details
   getUsers(): Observable<{id: string, data: User}[]> {
    this.users = this.usersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.users;
  }
 
  getUser(id): Observable<User> {
    return this.usersCollection.doc<User>(id).valueChanges();
  }

  getUserById(id): User {
    let user: User;
    this.usersCollection.ref.doc(id).get().then(doc=>{
      user = <User> doc.data();
    });
    return user;
  }
 
  updateUser(user: User, id: string) {
    return this.usersCollection.doc(id).update(user);
  }
 
  addUser(user: User) {
    return this.usersCollection.add(user);
  }
 
  removeUser(id) {
    return this.usersCollection.doc(id).delete();
  }

  getInstructors(){
    let users: {id: string, data: User}[] = [];
    this.usersCollection.ref.where("role", "==", "i").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        users.push({id: doc.id, data: <User> doc.data()});
      });
    });
    return users;
  }

  getInstructorsNotAdmins(){
    let users: {id: string, data: User}[] = [];
    this.usersCollection.ref.where("role", "==", "i").where("adminFeatures", "==", false).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        users.push({id: doc.id, data: <User> doc.data()});
      });
    });
    return users;
  }

  getAdmins(){
    let users: {id: string, data: User}[] = [];
    this.usersCollection.ref.where("adminFeatures", "==", true).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        users.push({id: doc.id, data: <User> doc.data()});
      });
    });
    return users;
  }

  getStudents(){
    let users: {id: string, data: User}[] = [];
    this.usersCollection.ref.where("role", "==", "s").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        users.push({id: doc.id, data: <User> doc.data()});
      });
    });
    return users;
  }
  
  
  // Handling subject details
  getSubjects(): Observable<{id: string, data: Subject}[]> {
    this.subjects = this.subjectsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.subjects;
  }
 
  getSubject(id): Observable<Subject> {
    return this.subjectsCollection.doc<Subject>(id).valueChanges();
  }
 
  updateSubject(subject: Subject, id: string) {
    return this.subjectsCollection.doc(id).update(subject);
  }
 
  addSubject(subject: Subject) {
    return this.subjectsCollection.add(subject);
  }
 
  removeSubject(id) {
    return this.subjectsCollection.doc(id).delete();
  }

  // Handling OTP details
  getOTPs(): Observable<{id: string, data: OTP}[]> {
    this.otps = this.otpsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.otps;
  }
 
  getOTP(id): Observable<OTP> {
    return this.otpsCollection.doc<OTP>(id).valueChanges();
  }
 
  updateOTP(otp: OTP, id: string) {
    return this.otpsCollection.doc(id).update(otp);
  }
 
  addOTP(otp: OTP) {
    return this.otpsCollection.add(otp);
  }
 
  removeOTP(id) {
    return this.otpsCollection.doc(id).delete();
  }
}
