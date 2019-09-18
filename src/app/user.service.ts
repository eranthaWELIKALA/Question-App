import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User{
  role?: string;
  username?: string;
  firstname: string;
  lastname: string;
  email: string;
  units: string;
  password?: string;
}

export interface Subject{
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersCollection: AngularFirestoreCollection<User>;
  private subjectsCollection: AngularFirestoreCollection<Subject>;

  private users: Observable<{id: string, data: User}[]>;
  private subjects: Observable<{id: string, data: Subject}[]>;

  constructor(private db: AngularFirestore) {
    this.usersCollection = db.collection<User>('users');
    this.subjectsCollection = db.collection<Subject>('subjects');
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
 
  updateUser(user: User, id: string) {
    return this.usersCollection.doc(id).update(user);
  }
 
  addUser(user: User) {
    return this.usersCollection.add(user);
  }
 
  removeUser(id) {
    return this.usersCollection.doc(id).delete();
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
