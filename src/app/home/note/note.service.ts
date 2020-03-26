import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { AngularFireUploadTask, AngularFireStorageReference, AngularFireStorage } from 'angularfire2/storage';

export interface Note{
  name: string;
  year: string;
  subject: string;
  grade_level: string;
  instructor: string;
  description: string;
  contentURL: string;
  metadata: string;
  timestamp: firebase.firestore.Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private notesCollection: AngularFirestoreCollection<Note>;

  private notes: Observable<{id: string, data: Note}[]>; 

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.notesCollection = db.collection<Note>('notes');
   }

   getNotes(): Observable<{id: string, data: Note}[]> {
    this.notes = this.notesCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.notes;
  }
 
  getNote(id): Observable<Note> {
    return this.notesCollection.doc<Note>(id).valueChanges();
  }
 
  updateNote(note: Note, id: string) {
    return this.notesCollection.doc(id).update(note);
  }
 
  addNote(note: Note) {
    return this.notesCollection.add(note);
  }
 
  removeNote(id) {
    return this.notesCollection.doc(id).delete();
  }

  async getNotesByInstructorId(instructorId: string){
    let notes: {id: string, data: Note}[] = [];
    await this.notesCollection.ref.where("instructor", "==", instructorId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        notes.push({id: doc.id, data: <Note> doc.data()});
      });
    });
    return notes;
  }

  async getNotesBySubjectId(subjectId: string){
    let notes: {id: string, data: Note}[] = [];
    await this.notesCollection.ref.where("subject", "==", subjectId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        notes.push({id: doc.id, data: <Note> doc.data()});
      });
    });
    return notes;
  }

  async getNotesBySubjectId_InstructorId(subjectId: string, instructorId: string){
    let notes: {id: string, data: Note}[] = [];
    await this.notesCollection.ref.where("subject", "==", subjectId).where("instructor", "==", instructorId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        notes.push({id: doc.id, data: <Note> doc.data()});
      });
    });
    return notes;
  }

  uploadPDF(file: File, fileName: string): {task: AngularFireUploadTask, fileRef: AngularFireStorageReference, path}{
    let path = `shortNotes/${new Date().getTime()}_${fileName}`;
    let customMetadata = { app: 'Question App'};
    let fileRef = this.storage.ref(path);

    let task = this.storage.upload(path, file, { customMetadata });
    return {task, fileRef, path};
  }

  removeImage(metadata){
    return this.storage.ref(metadata.fullPath).delete();
  }

  getPDF_URL(noteId: string){
    return this.storage.ref("shortNotes/" + noteId).getDownloadURL()
  }  
  
  async checkAvailability(id: string){
    let val = false;
    await this.notesCollection.ref.doc(id).get().then(doc => {
      doc.exists? val = true: val = false;
      console.log(val);
    });
    return val;
  }
}
