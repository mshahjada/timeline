import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../service/data.service';
import * as $ from 'jquery';
import * as datetimepicker from 'jquery-datetimepicker';
import * as moment from 'moment';
import { MessageComponent } from '../message/message.component';

// <span class='highlight-info'>{{ modalObj['time_d'] | date:'HH:mm' }}</span>

@Component({
  selector: 'app-tripmodal-content',
  providers:[MessageComponent],
  template: `
    <div class="modal-header">
      <div class='col-xs-3 col-sm-3 col-md-3 col-lg-3'>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class='col-xs-6 col-sm-6 col-md-6  col-lg-6 text-center' style='margin-top:4px'>
        <label class='text-white'>{{ modalObj['name'] }}</label>
      </div>
      <div class='btn-search-mode col-xs-3 col-sm-3 col-md-3 col-lg-3 text-right'>
        <div *ngIf='modalObj.trip_type !="FIXED"' class='modal-pax-label'>
            <div style='float:right'><label class='text-white'>{{ modalObj['pax'] }}</label></div>
            <div style='float:right'><img  src="{{ propertyImg['CustomerIcon'] }}" /></div>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class='row bottom-divider'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img  src="{{ propertyImg['BusIcon'] }}" />
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10'>
          <span><label class='text-shadow text-dg-height'> {{ 'Vehicle' | translate }}</label></span><br>
          <select [(ngModel)]='modalObj.vehicle_id' class='highlight-info form-control' style='height:22px;'>
            <option value=''>--Select Vehicle--</option>
            <option *ngFor="let item of dataset.Vehicles" [value]="item.vehicle_id">
              {{ item.name }} - {{ item.code }} - Pax({{ item.max_capacity }})
            </option>
          </select>
        </div>
      </div>

      <div class='row'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img src="{{propertyImg['DriverIcon']}}" />
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10'>
          <span><label class='text-shadow text-dg-height'>{{ 'Driver' | translate }}</label></span><br>
          <select [(ngModel)]='modalObj.driver_id' class='highlight-info form-control' style='height:22px;'>
            <option value=''>--Select Driver--</option>
            <option *ngFor="let item of dataset.Drivers" [value]="item.driver_id">
                    {{ item.name }} ({{ item.contact }})
            </option>
          </select>
        </div>  
      </div>

      <div class='row'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img src="{{propertyImg['ExternalCompany']}}" />
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10'>
          <label class='text-shadow text-dg-height'>{{ 'External Company' | translate }}</label>
          <span class='margin-top:4px;'><input type='checkbox' [(ngModel)]='modalObj.is_external'/></span>
        </div>
      </div>
      
      <div class='row' *ngIf='modalObj.trip_type =="FIXED"'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img  src="{{propertyImg['ShiftIcon']}}" />
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10' >
            <span><label class='text-shadow text-dg-height'>{{ 'Shift' | translate }}</label></span><br>
            <span>{{ modalObj['shift'] }}</span>
        </div>
      </div>

      <div class='row row-styler'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img  src="{{propertyImg['LinkArrowIcon']}}" />
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10'>
          <div class='row'>
            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
            <span><label class='text-shadow text-dg-height'>{{ 'From' | translate }}</label></span><br>
            <span>{{ modalObj['loc_from'] }}</span>
            </div>
            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
            <span><label class='text-shadow text-dg-height'>{{ 'To' | translate }}</label></span><br>
            <span>{{ modalObj['loc_to'] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class='row'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img  src="{{propertyImg['ClockIcon']}}" />
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10'>
            <div class='row date-region'>
                <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
                  <div class='region-divider-left'>
                    <span>Uttak</span><br>
                  </div>
                  <div class='region-divider-right'>
                    <input type='text' id='time_a' class='jdate' [(ngModel)]='modalObj.time_a'/>
                  </div>
                </div>
                <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
                  <div class='region-divider-left'>
                    <span>Oppdrag Slutt</span><br>
                  </div>
                  <div class='region-divider-right'>
                    <input type='text' id='time_d' class='jdate' [(ngModel)]='modalObj.time_d'/>
                  </div>
                </div>
            </div>
            <div class='row date-region' id='region-date-hide'>
                <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
                  <div class='region-divider-left'>
                    <span>Frammote</span><br>
                  </div>
                  <div class='region-divider-right'>
                    <input type='text' id='time_b1' class='jdate' [(ngModel)]='modalObj.time_b1'/>
                  </div>
                </div>
                <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
                  <div class='region-divider-left'>
                    <span>Kunde Slutt</span><br>
                  </div>
                  <div class='region-divider-right'>
                    <input type='text' id='time_c2' class='jdate' [(ngModel)]='modalObj.time_c2'/>
                  </div>
                </div>
            </div>
            <div class='row date-region'>
                <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
                  <div class='region-divider-left'>
                    <span>Avgang</span><br>
                  </div>
                  <div class='region-divider-right'>
                    <input type='text' id='time_b2' class='jdate' [(ngModel)]='modalObj.time_b2'/>
                  </div>
                </div>
                <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
                  <div class='region-divider-left'>
                    <span>Ankomst</span><br>
                  </div>
                  <div class='region-divider-right'>
                    <input type='text' id='time_c1' class='jdate' [(ngModel)]='modalObj.time_c1'/>
                  </div>
                </div>
            </div>
        </div>
      </div>

      <div class='row row-styler' *ngIf='modalObj.trip_type !="FIXED"'>
        <div class='btn-search-mode col-xs-2 col-sm-2 col-md-2 col-lg-2'>
          <img  src="{{propertyImg['InfoIcon']}}" style='width:15px; margin-left:10px;'/>
        </div>
        <div class='col-xs-10 col-sm-10 col-md-10 col-lg-10'>
          <div class='row'>
            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
              <span class='text-dg-height'>{{ 'Customer' | translate }}</span><br>
              <span class='highlight-text'>{{ modalObj['customer_name'] }}</span>
            </div>
            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
              <span class='text-dg-height'>{{ 'Contact Person' | translate }}</span><br>
              <span class='highlight-text'>{{ modalObj['contact_person_name'] }}</span>
            </div>
          </div>
          <div class='row'>
            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
              <span class='text-dg-height'>{{ 'Price' | translate }}</span><br>
              <span class='highlight-text'>{{ modalObj['price'] }}</span>
            </div>
            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'>
              <span class='text-dg-height'>{{ 'Contact No' | translate }}</span><br>
              <span class='highlight-text'>{{ modalObj['contact_person_mobile'] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="modal-footer">
        <button type="button" class="btn btn-sm btn-outline-dark" (click)="activeModal.dismiss('close')">{{ 'Cancel' | translate }}</button>
        <button type="button" class="btn btn-sm btn-outline-primary btn-save-trip" (click)="save()">{{ 'Save' | translate }}</button>
        <div class='trip-detail-link'>
          <a *ngIf='modalObj.trip_type !="FIXED"' href='{{tripUrl}}/details/{{modalObj.trip_id}}' target='_blank'>
            {{ 'View details' | translate }}
          </a>
          <a *ngIf='modalObj.trip_type ==="FIXED"' href='{{tripUrl}}/fixdetails/{{modalObj.trip_id}}' target='_blank'>
            {{ 'View details' | translate }}
          </a>
        </div>
    </div>
  `
})
// tslint:disable-next-line:component-class-suffix
export class TripModalContent {

  public ngbModalRef: NgbModalRef;

  @Input() name;

  modalRef = null;
  modalObj = null;
  dataset = null;
  propertyImg = null;
  date_format = 'DD/MM/YYYY HH:mm';

  open(type:string, refId:number, tripId:number): NgbModalRef {

    this.ngbModalRef = this.modalService.open(TripModalContent);

    let tripInfo = null;
    if(type==='vhe'){
      tripInfo = this.dataService.getVehicleTrip(refId, tripId);
    }else if(type==='dri'){
      tripInfo = this.dataService.getDriverTrip(refId, tripId);
    }else{
      tripInfo = this.dataService.getTripInfo(tripId);
    }

    const icon = this.dataService.getIcon();
    
    if(tripInfo===null){
      tripInfo=this.dataService.getTripInfoInstance();
    }


    this.propertyImg={
      CustomerIcon : icon['UserWhite'],
      BusIcon : icon['Bus'],
      DriverIcon : icon['DeliveryMan'],
      LinkArrowIcon : icon['LinkArrow'],
      ClockIcon : icon['Clock'],
      InfoIcon : icon['Info'],
      ShiftIcon : icon['Shift']
    };

    this.dataset={
      Drivers: this.dataService.getDriverTrips(),
      Vehicles: this.dataService.getVehicleTrips(),
    };


    this.modalObj={
      trip_id : tripInfo['trip_id'],
      name : tripInfo['name'],
      pax : tripInfo['pax'],
      shift: tripInfo['shift'],
      trip_type: tripInfo['trip_type'],
      is_external: tripInfo['external'],

      vehicle_id: tripInfo['vehicle_id'],
      driver_id: tripInfo['driver_id'],

      loc_from : tripInfo['loc_from'],
      loc_to : tripInfo['loc_to'],
      
      time_a : moment(new Date(tripInfo['time_a'])).format(this.date_format),
      time_b1 : ((tripInfo['trip_type']!=='FIXED') ? moment(new Date(tripInfo['time_b1'])).format(this.date_format) :tripInfo['time_b1']),
      time_b2 : moment(new Date(tripInfo['time_b2'])).format(this.date_format),
      time_c1 : moment(new Date(tripInfo['time_c1'])).format(this.date_format),
      time_c2 : ((tripInfo['trip_type']!=='FIXED') ? moment(new Date(tripInfo['time_c2'])).format(this.date_format) :tripInfo['time_c2']),
      time_d :  moment(new Date(tripInfo['time_d'])).format(this.date_format),
   
      price : tripInfo['price'],
      customer_name : tripInfo['customer_name'],
      contact_person_name : tripInfo['contact_person_name'],
      contact_person_mobile : tripInfo['contact_person_mobile'],
      status: tripInfo['status']
    };

    if(this.modalObj['trip_type']==='FIXED'){
      $('#region-date-hide').hide();
      $('#time_b2, #time_c1').prop('disabled', true);
    }

    this.ngbModalRef.componentInstance.propertyImg = this.propertyImg;
    this.ngbModalRef.componentInstance.dataset = this.dataset;
    this.ngbModalRef.componentInstance.tripUrl = this.dataService.hostUrl;
    this.ngbModalRef.componentInstance.modalObj = this.modalObj;
    this.ngbModalRef.componentInstance.baseObject = tripInfo;

    //$.datetimepicker({formatDate:'d-m-y', timepicker:false});
    $('.jdate').datetimepicker({format:'d/m/Y H:i'});
    if(this.modalObj['status']==='closed'){
      $('.jdate').prop('disabled',true);
      return;
    }

    return this.ngbModalRef;
  }

  view_detail(){

    if(this.modalObj['trip_type']==='FIXED'){
      window.open(this.dataService.hostUrl+'/planning/fixdetails/'+this.modalObj['trip_id'],'_blank');
    }else{
      window.open(this.dataService.hostUrl+'/planning/details/'+this.modalObj['trip_id'],'_blank');
    }
  }


  valid_date_time_cast():string{
    const validation_msg = 'Invalid Date';
    let error_msg='';
    let time_a = '';
    let time_b1 = '';
    let time_b2 = '';
    let time_c1 = '';
    let time_c2 = '';
    let time_d = '';
 

    time_a = this.dataService.valid_date_pattern($('#time_a').val());
    time_b2 = this.dataService.valid_date_pattern($('#time_b2').val());
    time_c1 = this.dataService.valid_date_pattern($('#time_c1').val());
    time_d = this.dataService.valid_date_pattern($('#time_d').val());

    if(this.modalObj['trip_type']!=='FIXED'){
      time_b1 = this.dataService.valid_date_pattern($('#time_b1').val());
      time_c2 = this.dataService.valid_date_pattern($('#time_c2').val());
    }

    if(new Date(time_a).toString() === validation_msg){
      error_msg = 'Withdrawal time is empty or invalid format given.';
    }else if(new Date(time_b1).toString() === validation_msg && this.modalObj['trip_type']!=='FIXED'){
      error_msg = 'Start Arrive time is empty or invalid format given.';
    }else if(new Date(time_b2).toString() === validation_msg){
      error_msg = 'Start Departure time is empty or invalid format given.';
    }else if(new Date(time_c1).toString() === validation_msg){
      error_msg = 'End Arrive time is empty or invalid format given.';
    }else if(new Date(time_c2).toString() === validation_msg && this.modalObj['trip_type']!=='FIXED'){
      error_msg = 'End Departure time is empty or invalid format given.';
    }else if(new Date(time_d).toString() === validation_msg){
      error_msg = 'Deliver date is empty or invalid format given.';
    }
    
    if(this.modalObj['trip_type']!=='FIXED'){
      if(new Date(time_a) > new Date(time_b1)){
        error_msg = 'Withdrawal time cannot be greater than Start Arrive time.';
      }else if(new Date(time_b1) > new Date(time_b2)){
        error_msg = 'Start Arrive time cannot be greater than Start Departure time.';
      }else if(new Date(time_b2) > new Date(time_c1)){
        error_msg = 'Start Departure time cannot be greater than End Arrive time.';
      }else if(new Date(time_c1) > new Date(time_c2)){
        error_msg = 'End Arrive cannot be greater than End Departure time.';
      }else if(new Date(time_c2) > new Date(time_d)){
        error_msg = 'End Departure time cannot be greater than Deliver time.';
      }
    }else{
      if(new Date(time_a) > new Date(time_b2)){
        error_msg = 'Withdrawal time cannot be greater than Start Departure time.';
      }else if(new Date(time_b2) > new Date(time_c1)){
        error_msg = 'Start Departure cannot be greater than End Arrive time.';
      }else if(new Date(time_c1) > new Date(time_d)){
        error_msg = 'End Arrive time cannot be greater than Deliver time.';
      }
    }

    return error_msg;
  }

  save():void {

    if(this.modalObj['status']==='closed'){
      this.message.open('Trip already closed', 'error');
      return;
    }

    const msg = this.valid_date_time_cast();
    
    if(msg!==''){
      this.message.open(msg, 'error');
      return;
    }

    let time_a = '';
    let time_b1 = '';
    let time_b2 = '';
    let time_c1 = '';
    let time_c2 = '';
    let time_d = '';

    time_a = this.dataService.valid_date_pattern($('#time_a').val());
    time_b2 = this.dataService.valid_date_pattern($('#time_b2').val());
    time_c1 = this.dataService.valid_date_pattern($('#time_c1').val());
    time_d = this.dataService.valid_date_pattern($('#time_d').val());

    this.modalObj['time_a'] = this.dataService.convert_local_time_user_utc_time(new Date(time_a)).split('.')[0];
    this.modalObj['time_b2'] = this.dataService.convert_local_time_user_utc_time(new Date(time_b2)).split('.')[0];
    this.modalObj['time_c1'] = this.dataService.convert_local_time_user_utc_time(new Date(time_c1)).split('.')[0];
    this.modalObj['time_d'] = this.dataService.convert_local_time_user_utc_time(new Date(time_d)).split('.')[0];

    if(this.modalObj['trip_type']!=='FIXED'){
      time_b1 = this.dataService.valid_date_pattern($('#time_b1').val());
      time_c2 = this.dataService.valid_date_pattern($('#time_c2').val());
      this.modalObj['time_b1'] = this.dataService.convert_local_time_user_utc_time(new Date(time_b1)).split('.')[0];
      this.modalObj['time_c2'] = this.dataService.convert_local_time_user_utc_time(new Date(time_c2)).split('.')[0];
    }
    
    this.activeModal.close('save');
  }

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, 
    public dataService : DataService, public message:MessageComponent) {
    }
}

@Component({
  selector: 'app-tripmodal-component',
  templateUrl: './tripmodal.component.html',
  styleUrls: ['./tripmodal.component.css']
 
  // templateUrl: './tripmodal.component.html',
  // styleUrls: ['./tripmodal.component.css'],
})

export class TripModalComponent   {
  constructor() {
  }
}
