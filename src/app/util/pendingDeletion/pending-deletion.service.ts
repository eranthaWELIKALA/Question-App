import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';

export interface PendingDeletion{
  type: string;
  ref_id: string;
  news_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class PendingDeletionService {

  private pendingDeletionCollection: AngularFirestoreCollection<PendingDeletion>;

  constructor(private db: AngularFirestore) {
    this.pendingDeletionCollection = db.collection<PendingDeletion>('pending_deletions');
   }

   addPendingDeletion(pDeletion: PendingDeletion){
    return this.pendingDeletionCollection.add(pDeletion);
   }

   async checkPendingDeletionByNewsId(news_id: string): Promise<boolean>{
     let result:boolean = false;
    await this.pendingDeletionCollection.ref.where("news_id", "==", news_id).get().then(doc=>{
      result = !doc.empty;
    });
    console.log(result);
    return result;
   }


}
