import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Attempt{
  user: string;
  paper: string;
  no_of_attempts: number;
  highest: number;
  lowest: number;
  average: number;
  timestamp: firebase.firestore.Timestamp
}

@Injectable({
  providedIn: 'root'
})
export class AttemptService {

  private attemptsCollection: AngularFirestoreCollection<Attempt>;
  private attempts: Observable<{id: string, data: Attempt}[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.attemptsCollection = db.collection<Attempt>('attempts');
  }

  // Handling user details
  getAttempts(): Observable<{id: string, data: Attempt}[]> {
    this.attempts = this.attemptsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.attempts;
  }
 
  getAttempt(id): Observable<Attempt> {
    return this.attemptsCollection.doc<Attempt>(id).valueChanges();
  }
 
  updateAttempt(attempt: Attempt, id: string) {
    return this.attemptsCollection.doc(id).update(attempt);
  }
 
  addAttempt(attempt: Attempt) {
    return this.attemptsCollection.add(attempt);
  }
 
  removeAttempt(id) {
    return this.attemptsCollection.doc(id).delete();
  }

  async getAttemptsByUserId(userId: string){
    let attempts: {id: string, data: Attempt}[] = [];
    await this.attemptsCollection.ref.where("user", "==", userId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        attempts.push({id: doc.id, data: <Attempt> doc.data()});
      });
    });
    return attempts;
  }

  async getAttemptsByUserId_PaperId(userId: string, paperId: string){
    let attempts: {id: string, data: Attempt}[] = [];
    await this.attemptsCollection.ref.where("user", "==", userId).where("paper", "==", paperId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        attempts.push({id: doc.id, data: <Attempt> doc.data()});
      });
    });
    return attempts;
  }
}
