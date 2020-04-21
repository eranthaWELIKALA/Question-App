import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireUploadTask, AngularFireStorageReference, AngularFireStorage } from 'angularfire2/storage';


export interface Question{
  subject: string;
  instructor: string;

  question: string;

  a: string;
  b: string;
  c: string;
  d: string;
  e: string;

  answer: string;

  paper: string;  
  number: string;
  
  image: boolean;
  image_url: string;
  metadata: string;
  image_A: boolean,
  imageA: string,
  a_metadata: string;
  image_B: boolean,
  imageB: string,
  b_metadata: string;
  image_C: boolean,
  imageC: string,
  c_metadata: string;
  image_D: boolean,
  imageD: string,
  d_metadata: string;
  image_E: boolean,
  imageE: string,
  e_metadata: string;
}

@Injectable({
  providedIn: 'root'
})

export class QuestionService {

  private questionsCollection: AngularFirestoreCollection<Question>;

  private questions: Observable<{id: string, data: Question}[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
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

   uploadImage(file: File): {task: AngularFireUploadTask, fileRef: AngularFireStorageReference, path}{
    let fileName = file.name;
    let path = `questionImages/${new Date().getTime()}_${fileName}`;
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

  async getQuestionsByPapers(paperId: string){
    let questions: {id: string, data: Question}[] = [];
    await this.questionsCollection.ref.where("paper", "==", paperId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        questions.push({id: doc.id, data: <Question> doc.data()});
      });
    });
    return questions;
  }

  async getQuestionsBySubjects(subjectId: string){
    let questions: {id: string, data: Question}[] = [];
    await this.questionsCollection.ref.where("subject", "==", subjectId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        questions.push({id: doc.id, data: <Question> doc.data()});
      });
    });
    return questions;
  }

  async getQuestionsByInstructors(instructorId: string){
    let questions: {id: string, data: Question}[] = [];
    await this.questionsCollection.ref.where("instructor", "==", instructorId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        questions.push({id: doc.id, data: <Question> doc.data()});
      });
    });
    return questions;
  }
}