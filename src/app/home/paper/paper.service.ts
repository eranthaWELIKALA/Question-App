import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Paper{
  name: string;
  year: string;
  instructor: string;
  subject: string;
  grade_level: string;
  no_of_questions: number;
  added_questions: number;
  time: string;
  price: string;
  published: boolean
}

@Injectable({
  providedIn: 'root'
})
export class PaperService {

  private papersCollection: AngularFirestoreCollection<Paper>;

  private papers: Observable<{id: string, data: Paper}[]>;

  constructor(private db: AngularFirestore) {
    this.papersCollection = db.collection<Paper>('papers');
   }

   getPapers(): Observable<{id: string, data: Paper}[]> {
    this.papers = this.papersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.papers;
  }
 
  getPaper(id): Observable<Paper> {
    return this.papersCollection.doc<Paper>(id).valueChanges();
  }
 
  updatePaper(paper: Paper, id: string) {
    return this.papersCollection.doc(id).update(paper);
  }
 
  addPaper(paper: Paper) {
    return this.papersCollection.add(paper);
  }
 
  removePaper(id) {
    return this.papersCollection.doc(id).delete();
  }

  async getPapersByInstructorId(instructorId: string){
    let papers: {id: string, data: Paper}[] = [];
    await this.papersCollection.ref.where("instructor", "==", instructorId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        papers.push({id: doc.id, data: <Paper> doc.data()});
      });
    });
    return papers;
  }

  async getPapersBySubjectId(subjectId: string){
    let papers: {id: string, data: Paper}[] = [];
    await this.papersCollection.ref.where("subject", "==", subjectId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        papers.push({id: doc.id, data: <Paper> doc.data()});
      });
    });
    return papers;
  }

  async getPapersBySubjectId_InstructorId(subjectId: string, instructorId: string){
    let papers: {id: string, data: Paper}[] = [];
    await this.papersCollection.ref.where("subject", "==", subjectId).where("instructor", "==", instructorId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        papers.push({id: doc.id, data: <Paper> doc.data()});
      });
    });
    console.log(papers);
    return papers;
  }
  
  async checkAvailability(id: string){ 
    let val = false;
    await this.papersCollection.ref.doc(id).get().then(doc=>{
      doc.exists? val = true: val = false;
      console.log(val);
    });
    return val;
  }
}
