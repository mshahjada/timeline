import { Component, OnInit } from '@angular/core';
import { DataService } from './service/data.service';
import { TripModalContent } from './tripmodal/tripmodal.component';
import { AirMailContent } from './air-mail/air-mail.component';
import { MessageComponent } from './message/message.component';

import { TripDirective } from './directive/trip.directive';
import {Http} from '@angular/http';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import * as firebase from 'firebase';
import { AngularFireModule } from 'angularfire2';
import { MessagingService } from './service/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers:[TripModalContent, NgbActiveModal, AirMailContent, MessageComponent, 
    MessagingService, AngularFireModule],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

//, AngularFireDatabase, AngularFireAuth
// private db:AngularFireDatabase, 
  IsDriverView=false;
  message;

  constructor(private dataService: DataService, private http: Http, private msg: MessagingService){

    this.IsDriverView = this.dataService.getViewMode();
    document.onkeyup=function(evt){
      if(evt.which===13 || evt.which===27){
        dataService.hideCalender(); //Calender Hide
        dataService.hideCustomPopUp(1); // All
      }
    };
  }

  ngOnInit(){

    this.dataService.getFirebaseConfig().subscribe(res=>{
      console.log(res);
      firebase.initializeApp({'messagingSenderId':res['messagingSenderId']});
      AngularFireModule.initializeApp(res);
      this.msg.serve();
      //this.msg.getPermission();
      this.msg.receiveMessage();
      this.message = this.msg.currentMessage;
    },(err) => {
    }
  );
   
    
  }
}
