import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';
import { map } from 'rxjs/operators';
import { PaperService } from '../paper/paper.service';
import { NoteService } from '../note/note.service';
import { id } from '@swimlane/ngx-datatable';

export interface Newsfeed{
  userId: string;
  description: string;
  type: string;
  ref_id: string; // id of the reference 

  posted_timestamp: firebase.firestore.Timestamp;
  timestamp: firebase.firestore.Timestamp;

  likes: number;
  likedUsers: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsfeedService {

  private newsfeedsCollection: AngularFirestoreCollection<Newsfeed>;
  private newsfeeds: Observable<{id: string, data: Newsfeed}[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage, private paperService: PaperService, private noteService: NoteService) {
    this.newsfeedsCollection = db.collection<Newsfeed>('newsfeeds');
  }

  // Handling user details
  getNewsfeeds(): Observable<{id: string, data: Newsfeed}[]> {
    this.newsfeeds = this.newsfeedsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        });
      })
    );
    return this.newsfeeds;
  }

  getNewsfeedList(): {id: string, data: Newsfeed}[] {
    let newsfeeds: {id: string, data: Newsfeed}[] = [];
    this.newsfeedsCollection.ref.orderBy("timestamp").limit(100).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        newsfeeds.push({id: doc.id, data: <Newsfeed> doc.data()});
      });
    });
    return newsfeeds;
  }

  async getNewsfeedsByUserId(userId: string) {
    let newsfeeds: {id: string, data: Newsfeed}[] = [];
    await this.newsfeedsCollection.ref.where("userId","==", userId).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        newsfeeds.push({id: doc.id, data: <Newsfeed> doc.data()});
      });
    });
    return newsfeeds;
  }
 
  getNewsfeed(id): Observable<Newsfeed> {
    return this.newsfeedsCollection.doc<Newsfeed>(id).valueChanges();
  }
 
  updateNewsfeed(newsfeed: Newsfeed, id: string) {
    return this.newsfeedsCollection.doc(id).update(newsfeed);
  }
 
  addNewsfeed(newsfeed: Newsfeed) {
    return this.newsfeedsCollection.add(newsfeed);
  }
 
  removeNewsfeed(id) {
    return this.newsfeedsCollection.doc(id).delete();
  }

  removeNewsfeedByRefId(ref_id) {
    return this,this.newsfeedsCollection.ref.where("ref_id", "==", ref_id).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        this.removeNewsfeed(doc.id);
      });
    });
  }

  async checkAvailability(type: string, id: string){
    let val = false;
    if(type=="Paper"){
      await this.paperService.checkAvailability(id).then(onfulfilled=>{
        val = onfulfilled;
      }, onrejected=>{
        console.log(onrejected);
        val = false;
      });
    }
    else if(type=="Note"){
      await this.noteService.checkAvailability(id).then(onfulfilled=>{
        val = onfulfilled;
      }, onrejected=>{
        console.log(onrejected);
        val = false;
      });
    }
    else{
      val = false;
    }
    return val;
  }

  // async getNewsfeedsByUserId(userId: string){
  //   let newsfeeds: {id: string, data: Newsfeed}[] = [];
  //   await this.newsfeedsCollection.ref.where("user", "==", userId).get().then(function (querySnapshot) {
  //     querySnapshot.forEach(function (doc) {
  //       newsfeeds.push({id: doc.id, data: <Newsfeed> doc.data()});
  //     });
  //   });
  //   return newsfeeds;
  // }

  // async getNewsfeedsByUserId_PaperId(userId: string, paperId: string){
  //   let newsfeeds: {id: string, data: Newsfeed}[] = [];
  //   await this.newsfeedsCollection.ref.where("user", "==", userId).where("paper", "==", paperId).get().then(function (querySnapshot) {
  //     querySnapshot.forEach(function (doc) {
  //       newsfeeds.push({id: doc.id, data: <Newsfeed> doc.data()});
  //     });
  //   });
  //   return newsfeeds;
  // }
}
