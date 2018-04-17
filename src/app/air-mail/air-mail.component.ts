import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../service/data.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { MessageComponent } from '../message/message.component';
import { notification } from '../message/notify';

@Component({
  providers:[MessageComponent],
  selector: 'app-air-mail-content',
  template: `
    <div class="modal-header air-mail-trip">
      <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2'>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class='col-xs-8 col-sm-8 col-md-8  col-lg-8 text-center' style='margin-top:4px'>
        <strong>{{ modalObj['name'] }}</strong>
      </div>
      <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2'>
      
      </div>
    </div>

    <div class="modal-body">

      <div class='row'>
        <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
          <label class="text-shadow flight-label">Flight Number</label><br>
          <input type='text' class='form-control '  [(ngModel)]='modalObj.flight_number' required/>
        </div>
        <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
          <label class="text-shadow flight-label">Group Reference</label><br>
          <input type='text' class='form-control' [(ngModel)]='modalObj.group_reference' required/>
        </div>
      </div>

      <div class='row mail-modal'>
        <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
          <label class="highlight-text">Airport Name</label><br>
        </div>
        <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
          <label class="highlight-text">E-Post</label><br>
        </div>
      </div>

      <div class='row' *ngFor="let item of modalObj['airport_list']">
        <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6' style='display: inline-flex;'>
          <input type='radio' [checked]='item.id===modalObj.airport_id' name='airport' class='airport-selector' attr.air-id={{item.id}}/>
          <span class="text-shadow">{{ item['name'] }}</span>
        </div>
        <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6' style='display: inline-flex;'>
          <span class="text-shadow">{{ item['email'] }}</span>
        </div>
      </div>
    </div>

    <div class="modal-footer" style='height:60px'>
      <button type="button" class="btn btn-sm btn-outline-primary" (click)="EventFire('save')">{{ 'Save'  | translate }}</button>
      <button type="button" class="btn btn-sm btn-outline-primary" (click)="EventFire('send')">{{ 'Send Mail'  | translate }}</button>
    </div>
  `
})
// tslint:disable-next-line:component-class-suffix
//
export class AirMailContent {

  public ngbModalRef: NgbModalRef;

  modalRef = null;
  modalObj = null;
  tripInfo = null;

  open(tripinfo, airportList): NgbModalRef {

    this.ngbModalRef = this.modalService.open(AirMailContent);

    this.tripInfo = tripinfo;

    this.modalObj={
      trip_id: this.tripInfo['trip_id'],
      airport_id: this.tripInfo['airport_id'],
      name : this.tripInfo['name'],
      flight_number : this.tripInfo['flight_number'],
      group_reference : this.tripInfo['group_reference'],
      airport_list: airportList,
    };

    this.ngbModalRef.componentInstance.modalObj = this.modalObj;
    return this.ngbModalRef;
  }


  EventFire(target_txt){
    
    let air_id=0;
    const air_list = document.getElementsByClassName('airport-selector');
    for(let i=0; i<air_list.length;i++){
      if(air_list[i]['checked']){
        air_id = parseInt(air_list[i].getAttribute('air-id'), 10) ;
      }
    }

    const errors=[];
    
    if(this.modalObj['flight_number'].trim()===''){
      errors.push('Flight number required.');
    }
    if(this.modalObj['group_reference'].trim()===''){
      errors.push('Group reference required.');
    }
    if(air_id===0){
      errors.push('No selected airport found.');
    }



    if(errors.length>0){
      this.message.open(errors, 'error');
    }else{
      const obj={
        action:target_txt,
        trip_id: this.modalObj['trip_id'],
        airport_id: air_id,//
        flight_number : this.modalObj['flight_number'],
        group_reference : this.modalObj['group_reference']
      };
  
      this.activeModal.close();
      this.dataService.airportEvent(obj).subscribe(res=>{
        this.dataService.hideOverlayDisplay();
        const msg_txt = (target_txt==='send')? notification.mailsend : notification.success;
        this.message.open(msg_txt, 'success');
        setTimeout(()=>{
          this.message.close();
        },2000);
       
        },(err: HttpErrorResponse) => {
          this.dataService.hideOverlayDisplay();
          const errorHandler = this.dataService.errorGenerator(err);
          this.message.open(errorHandler['Errors'], 'error');
          //setTimeout(()=>{ this.message.close(); },2000);
        }
      );
    }
  }

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, 
    public dataService : DataService, public message: MessageComponent) {
  }
}


@Component({
  selector: 'app-air-mail',
  templateUrl: './air-mail.component.html',
  styleUrls: ['./air-mail.component.css']
})
export class AirMailComponent {

  constructor() { }

}





