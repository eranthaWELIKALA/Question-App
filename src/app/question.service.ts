import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Question{
  subject: string;
  question: string;
  instructor: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  answer: string;
  papers: string;
  
}

@Injectable({
  providedIn: 'root'
})

export class QuestionService {

  private questionsCollection: AngularFirestoreCollection<Question>;

  private questions: Observable<{id: string, data: Question}[]>;

  constructor(private db: AngularFirestore) {
    this.questionsCollection = db.collection<Question>('questions');

    //this.questions = this.questionsCollection.valueChanges();
    /*this.questions = this.questionsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          console.log(id);
          return { id, data };
        });
      })
    );*/
   }

  getQuestions(): Observable<{id: string, data: Question}[]> {
    this.questions = this.questionsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.questions;
  }
 
  getQuestion(id): Observable<Question> {
    return this.questionsCollection.doc<Question>(id).valueChanges();
  }
 
  updateQuestion(question: Question, id: string) {
    return this.questionsCollection.doc(id).update(question);
  }
 
  addQuestion(question: Question) {
    return this.questionsCollection.add(question);
  }
 
  removeQuestion(id) {
    return this.questionsCollection.doc(id).delete();
  }
}