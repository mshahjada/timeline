import { Injectable } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataService } from '../service/data.service';

@Injectable()
export class MessagingService {

  messaging ;
  currentMessage;
//private db:AngularFireDatabase, private afAuth: AngularFireAuth
   constructor(private dataService: DataService ) { }

   serve(){
    this.messaging = firebase.messaging();
    this.currentMessage = new BehaviorSubject(null);
   }


  // updateToken(token) {
  //   this.afAuth.authState.take(1).subscribe(user => {
  //     if (!user){
  //       return;
  //     } 

  //     const data = { [user.uid]: token };
  //     this.db.object('fcmTokens/').update(data);

  //     console.log(this.db);
  //   });
  // }

  // getPermission() {
  //     this.messaging.requestPermission()
  //     .then(() => {
  //       console.log('Notification permission granted.');
  //       return this.messaging.getToken();
  //     })
  //     .then(token => {
  //       console.log(token);
  //       //this.updateToken(token);
  //     })
  //     .catch((err) => {
  //       console.log('Unable to get permission to notify.', err);
  //     });
  // }

  receiveMessage() {
       this.messaging.onMessage((payload) => {
        
        if(payload.hasOwnProperty('data')){
          if(payload['data'].hasOwnProperty('action') && payload['data']['action']==='planning'){
              if(this.dataService.isDriverView){
                console.log('Reqesting for drive view .......');
                this.dataService.getDriverTripByQuery(false, false);
                this.dataService.getTripInfosByQuery(false, false);
              }else{
                console.log('Reqesting for vehicle view .......');
                this.dataService.getVehicleTripByQuery(false, false);
                this.dataService.getTripInfosByQuery(false, false);
              }
          }
        }

        this.currentMessage.next(payload);
      });

   }

}
