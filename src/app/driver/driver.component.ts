import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { TripModalContent } from '../tripmodal/tripmodal.component';
import { AirMailContent } from '../air-mail/air-mail.component';
import { MessageComponent } from '../message/message.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { notification } from '../message/notify';


@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css'],
})

export class DriverComponent implements OnInit {
  type = 'dri';
  drivers = this.dataService.getDriverTrips();

  has_pax_limit=false;
  is_overlap = false;

  trace_point = -1;
  changeEfffect=function(event){

    const trip_rows = document.getElementById('panel-time-schedule').getElementsByClassName('time-line-trip');
    const offset_width = trip_rows[0]['offsetWidth'];
    const time_panel = document.getElementsByClassName('time-panel hour-segment')[0];

    let zoom_percentage = 0;
    let left_margin = 0;
    let actual_margin = 0;
    if(time_panel.hasAttribute('style')){
      zoom_percentage = parseFloat(time_panel['style'].width) - 100;
      left_margin = parseFloat(time_panel['style'].marginLeft);
    }

    if( isNaN(zoom_percentage) || zoom_percentage<=0){
      return false;
    }

     if(parseInt(event['movementX'],10)>1){ 
        //X-Axis Positive Traverse
        if(this.trace_point!==undefined && left_margin<0 && event['clientX']>this.trace_point){
          const move_in_px = (event['clientX'] - this.trace_point);
          const percentage = move_in_px/(offset_width/100);
          this.trace_point = event['clientX'];
          
          actual_margin = left_margin + percentage;
          actual_margin = (actual_margin>0)? 0: actual_margin;
          if(actual_margin<=0){
            time_panel['style'].marginLeft = actual_margin+'%';
            for(let i=0; i<trip_rows.length;i++){
              const trip_panel = trip_rows[i].getElementsByClassName('time-panel')[0];
              if(trip_panel.hasAttribute('style')){
                trip_panel['style'].marginLeft = actual_margin+'%';
              }
            }
          }
        }else{
          this.trace_point = parseInt(time_panel.getAttribute('trace-point'),10) ;
        }
      }else if(parseInt(event['movementX'],10)<0){
        //X-Axis Negative Traverse
        if(this.trace_point!==undefined && zoom_percentage>= (-1*left_margin) && event['clientX']<this.trace_point){
          const move_in_px = (this.trace_point - event['clientX']);
          const percentage = move_in_px/(offset_width/100);
          this.trace_point = event['clientX'];

          actual_margin = left_margin - percentage;
          actual_margin = (actual_margin>zoom_percentage)? actual_margin: actual_margin;

          if(actual_margin<=0){
            time_panel['style'].marginLeft = actual_margin+'%';
            for(let i=0; i<trip_rows.length;i++){
              const trip_panel = trip_rows[i].getElementsByClassName('time-panel')[0];
              if(trip_panel.hasAttribute('style')){
                trip_panel['style'].marginLeft = actual_margin+'%';
              }
            }
          }
        }else{
          this.trace_point = time_panel.getAttribute('trace-point');
        }
      }
  };

  panel_move_active(event):void{
    if(!event['shiftKey']){ return; }
    document.onselectstart = function() {return false; };
    document.getElementsByClassName('time-panel hour-segment')[0].setAttribute('trace-point',event['clientX']);
    document.addEventListener('mousemove', this.changeEfffect, false);
  }
 
  panel_move_deactive(event):void{
    document.onselectstart = function() {return true; };
    document.getElementsByClassName('time-panel hour-segment')[0].setAttribute('trace-point','0');
    document.removeEventListener('mousemove', this.changeEfffect, false);
  }

  panel_out_deactive(event):void{
    document.onselectstart = function() {return true; };
    document.getElementsByClassName('time-panel hour-segment')[0].setAttribute('trace-point','0');
    document.removeEventListener('mousemove', this.changeEfffect, false);
  }

  savetrip(t_obj, tripInfo){
    this.dataService.saveTrip(t_obj, false, this.is_overlap, this.has_pax_limit).subscribe(res => {
      this.dataService.hideOverlayDisplay();
      if(res['id']>0){
        const tempTripInfo = Object.create(tripInfo);
        tempTripInfo['vehicle_id'] = t_obj['vehicle_id'];
        tempTripInfo['driver_id'] = t_obj['driver_id'];

        res=this.dataService.tripTrimeConversion(res);
        tempTripInfo['time_a'] = res['time_a'];
        tempTripInfo['time_b1'] = res['time_b1'];
        tempTripInfo['time_b2'] = res['time_b2'];
        tempTripInfo['time_c1'] = res['time_c1'];
        tempTripInfo['time_c2'] = res['time_c2'];
        tempTripInfo['time_d'] = res['time_d'];
        tempTripInfo['external'] = res['is_external'];

        this.dataService.removeVehicleTrip(tripInfo['vehicle_id'], tripInfo['trip_id']);
        this.dataService.addVehicleTrip(tempTripInfo['vehicle_id'], tempTripInfo);

        this.dataService.removeDriverTrip(tripInfo['driver_id'], tripInfo['trip_id']);
        if(parseInt(tempTripInfo['driver_id'],10) >0){
          this.dataService.addDriverTrip(tempTripInfo['driver_id'], tempTripInfo);
        }else{
          this.dataService.addTrip(tempTripInfo);
        }

        this.message.open(notification.success, 'success');
        setTimeout(()=>{
          // if(this.is_overlap){
          //   if(tripInfo['trip_type']==='FIXED'){
          //     window.open(this.dataService.hostUrl+'/planning/fixdetails/'+tripInfo['trip_id'],'_blank');
          //   }else{
          //     window.open(this.dataService.hostUrl+'/planning/details/'+tripInfo['trip_id'],'_blank');
          //   }
          // }
          this.message.close();
        },2000);
      }
    },
    (err: HttpErrorResponse) => {
      this.dataService.hideOverlayDisplay();
      const errorHandler = this.dataService.errorGenerator(err);
      this.message.open(errorHandler['Errors'], 
      ((errorHandler['IsOverlapped'] || errorHandler['hasPaxError'])? 'decision': 'error')).result.then(res=>{
        if(res==='proceed'){
          this.has_pax_limit = (errorHandler['hasPaxError'])? true: this.has_pax_limit;
          this.is_overlap = (errorHandler['IsOverlapped'])? true:this.is_overlap;
          this.savetrip(t_obj, tripInfo);
        }
      });
    });
  }

  getTripInfo(event, callback): void{
    if(event['shiftKey']){ return; }

    if(!event['target'].parentNode.classList.contains('airport-trip')){
      this.type = event.currentTarget.getAttribute('typedef');
      const refId = parseInt(event.currentTarget.getAttribute('refid'),10);
      const tripId = parseInt(event.currentTarget.getAttribute('tripid'),10);

      callback = this.modalService.open(this.type, refId, tripId);
      const obj = callback.componentInstance.modalObj;
      const tripInfo = callback.componentInstance.baseObject;

      callback.result.then((result) => {
        const vehicleId = ((isNaN(tripInfo['vehicle_id']) || tripInfo['vehicle_id']==='')? 0 :  parseInt(tripInfo['vehicle_id'],10));      
        const driverId = ((isNaN(tripInfo['driver_id']) || tripInfo['driver_id']==='' )? 0 :  parseInt(tripInfo['driver_id'],10));
          
        const t_vehicleId = ((isNaN(obj['vehicle_id']) || obj['vehicle_id']==='')? 0 :  parseInt(obj['vehicle_id'],10));
        const t_driverId = ((isNaN(obj['driver_id']) || obj['driver_id']==='')? 0 :  parseInt(obj['driver_id'],10));

        const t_obj = {
          trip_id: tripInfo['trip_id'],
          name: tripInfo['name'],
          vehicle_id: t_vehicleId,
          driver_id: t_driverId,
          time_a: obj['time_a'],
          time_b1: obj['time_b2'],
          time_b2: obj['time_b2'],
          time_c1: obj['time_c1'],
          time_c2: obj['time_c2'],
          time_d: obj['time_d'],
          external: obj['is_external']
        };
        this.has_pax_limit=false;
        this.is_overlap = false;
  
        this.savetrip(t_obj, tripInfo);
      
      }, (reason) => {
        
      });
    }
    
  }

  showPanel(event): void{
    if(event['shiftKey']){ return; }
    
    this.type = event.currentTarget.getAttribute('typedef');
    const refId = parseInt(event.currentTarget.getAttribute('refid'),10);
    const tripId = parseInt(event.currentTarget.getAttribute('tripid'),10);

    this.dataService.showTripInfoPanel(event, this.type, refId, tripId);
  }

  hidePanel(): void{
    this.dataService.hideTripInfoPanel();
  }

  show_activity(event, obj, header_title):void{
    this.dataService.show_popup(event, 'periodical-popup');
    this.dataService.set_current_selected_period(header_title, obj);
  }

  hide_activity():void{
    this.dataService.hide_activity_panel();
  }

  airportNotifier(event, callback):void{
    if(event['shiftKey']){ return; }
    
    if(event['target'].parentNode.classList.contains('airport-trip')){
      this.type = event['target'].parentNode.parentNode.getAttribute('typedef');
      const refId = parseInt(event['target'].parentNode.parentNode.getAttribute('refid'),10);
      const tripId = parseInt(event['target'].parentNode.parentNode.getAttribute('tripid'),10);

      const tripinfo = this.dataService.get_trip_info_by_classification(this.type, refId, tripId);

      if(tripinfo===null){
        this.message.open('Invalid trip', 'error');
      }else if(tripinfo['vehicle_id']==='' || isNaN(tripinfo['vehicle_id']) ||  parseInt(tripinfo['vehicle_id'],10)<=0){
        this.message.open('Vehicle yet not assigned.', 'error');
      }else{
        this.dataService.getAirportList().subscribe(res=>{
          if(res!=null && res[0].hasOwnProperty('id')){
              callback = this.airMailService.open(tripinfo, res);
              const obj = callback.componentInstance.modalObj;
              callback.result.then((result) => {
                  if(result === 'mail'){
                  }
                },(reason) => {
        
                }
              );
          }
        },(err: HttpErrorResponse) => {
         }
        );
      }



     
    }
  }

  refreshData(IsLoaderView){
    this.dataService.getDriverTripByQuery(IsLoaderView, false);
    this.dataService.getTripInfosByQuery(false, IsLoaderView);
  }
  
  constructor(public dataService:DataService,  public modalService: TripModalContent, 
    public message: MessageComponent, public airMailService: AirMailContent) { 
    
  }

  ngOnInit() {
    this.dataService.getConfiguration().subscribe(res=>{
        if(res!=null && res.hasOwnProperty('trip_types')){
            this.dataService.trip_types=res['trip_types'];
        }
        if(res!=null && res.hasOwnProperty('vehicle_types')){
          this.dataService.vehicle_types = res['vehicle_types'];
        }
        this.refreshData(true);
      },(err: HttpErrorResponse) => {
      }
    );

    // setInterval(()=>{ this.refreshData(false); }, 60000);
  }
}
