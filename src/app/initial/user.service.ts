import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User{
  adminFeatures: boolean;
  contact: string;
  create: firebase.firestore.Timestamp;
  email: string;
  firstname: string;
  img_url: string;
  lastname: string;
  role: string;
  verify: string;
  grade_level: string;
  metadata: string;
  units: string[];
}

export interface Instructor{
  achievement: string[];
  backgroundImagePath: string;
  degree: string;
  degreeMSc: string;
  degreePhd: string;
  degreeYear: string;
  email: string;
  grad: string;
  gradeA: string;
  gradeB: string;
  gradeC: string;
  gradeS: string;
  personalAchievement: string[];
  profileImagePath: string;
  subject: string;
  teachingSchool: string;
  university: string;
  universityMSc: string;
  universityPhD: string;
  verify: string;
  yearExperiences: string;
  yearMSc: string;
  yearPhD: string;
}

export interface Student{
  email: string;
  subject: string;
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
  private instructorCollection: AngularFirestoreCollection<Instructor>;
  private studentCollection: AngularFirestoreCollection<Student>;
  private subjectsCollection: AngularFirestoreCollection<Subject>;

  private users: Observable<{id: string, data: User}[]>;
  private subjects: Observable<{id: string, data: Subject}[]>;
  private otps: Observable<{id: string, data: OTP}[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.usersCollection = db.collection<User>('users');
    this.instructorCollection = db.collection<Instructor>('instructor');
    this.studentCollection = db.collection<Student>('student');
    this.subjectsCollection = db.collection<Subject>('subjects');
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
    return this.usersCollection.add(user).then(async onfulfilled=>{
      let id = onfulfilled.id;
      if(user.role=="instructor"){
        let instructor: Instructor = {
          achievement: [],
          backgroundImagePath: "",
          degree: "",
          degreeMSc: "",
          degreePhd: "",
          degreeYear: "",
          email: user.email,
          grad: "",
          gradeA: "",
          gradeB: "",
          gradeC: "",
          gradeS: "",
          personalAchievement: [],
          profileImagePath: "",
          subject: "",
          teachingSchool: "",
          university: "",
          universityMSc: "",
          universityPhD: "",
          verify: user.verify,
          yearExperiences: "",
          yearMSc: "",
          yearPhD: ""
        }
        await this.instructorCollection.doc(id).set(instructor);
      }
      else if(user.role=="student"){
        let student: Student = {
          email: user.email,
          subject: ""
        }
        await this.studentCollection.doc(id).set(student);
      }
      else{
        // nothing to do
      }
    });
  }
 
  removeUser(id) {
    return this.usersCollection.doc(id).delete();
  }

  getInstructors(){
    let users: {id: string, data: User}[] = [];
    this.usersCollection.ref.where("role", "==", "instructor").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        users.push({id: doc.id, data: <User> doc.data()});
      });
    });
    return users;
  }

  getInstructorsNotAdmins(){
    let users: {id: string, data: User}[] = [];
    this.usersCollection.ref.where("role", "==", "instructor").where("adminFeatures", "==", false).get().then(function (querySnapshot) {
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
    this.usersCollection.ref.where("role", "==", "student").get().then(function (querySnapshot) {
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
}
