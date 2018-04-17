import { Directive, ElementRef, HostListener } from '@angular/core';
import { debug, debuglog } from 'util';
import { DataService } from '../service/data.service';
import { MessageComponent } from '../message/message.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { notification } from '../message/notify';
//import { setInterval } from 'timers';

@Directive({
  selector: '[appTripdrop]'
})
export class TripdropDirective {

  dropElem=null;
  currentTrips = [];
  width=0;
  count=0;
  has_pax_limit=false;
  is_overlap = false;
  constructor(private el: ElementRef, public dataService: DataService, public message: MessageComponent) { }
  

  drop_trip(tripId, dragType, dropType, dropRefId, tripInfo){
    this.dataService.visibleOverlayDisplay();
    this.dataService.saveByDrop(dragType, dropType, dropRefId, tripInfo, this.is_overlap, this.has_pax_limit).subscribe(res => {
      this.dataService.hideOverlayDisplay();
      if(res['id']>0){

        //Update Attribute Value
        this.dropElem.setAttribute('typedef', dropType);
        this.dropElem.setAttribute('refid', dropRefId.toString());
        this.dropElem.setAttribute('id', ''+dropType+'-trip-'+dropRefId+'-'+tripId);

        // get trip info
        tripInfo = this.dataService.set_trip_time(tripInfo, res);

        tripInfo = this.dataService.tripTrimeConversion(tripInfo);
        if(dragType === 'vhe' && tripInfo['vehicle_id']>0){
          this.dataService.removeVehicleTrip(tripInfo['vehicle_id'], tripInfo['trip_id']);
        } else if( dragType === 'dri' && tripInfo['driver_id']>0){
          this.dataService.removeDriverTrip(tripInfo['driver_id'], tripInfo['trip_id']);
        }else{
          this.dataService.removeTrip(tripInfo['trip_id']);
        }

        if(dropType==='vhe'){
          tripInfo['vehicle_id'] = dropRefId;
          this.dataService.addVehicleTrip(dropRefId, tripInfo);
        }else if(dropType==='dri'){
          tripInfo['driver_id'] = dropRefId;
          this.dataService.addDriverTrip(dropRefId, tripInfo);
        }else{
          tripInfo['vehicle_id'] = (!this.dataService.getViewMode())? '' : tripInfo['vehicle_id'];
          tripInfo['driver_id'] = (this.dataService.getViewMode())? '' : tripInfo['driver_id'];
          this.dataService.addTrip(tripInfo);
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
    }, (err: HttpErrorResponse) => {
      this.dataService.hideOverlayDisplay();
      const errorHandler = this.dataService.errorGenerator(err);
      this.message.open(errorHandler['Errors'], 
      ((errorHandler['IsOverlapped'] || errorHandler['hasPaxError'])? 'decision': 'error')).result.then(res=>{
        if(res==='proceed'){
           this.has_pax_limit = (errorHandler['hasPaxError'])? true: this.has_pax_limit;
           this.is_overlap = (errorHandler['IsOverlapped'])? true:this.is_overlap;
           this.drop_trip(tripId, dragType, dropType, dropRefId, tripInfo);
          // window.open(this.dataService.redirectUrl,'_blank');
        }
      });

    }
  );
  }


  @HostListener('dragover',['$event']) onDragOver(ev){
    ev.preventDefault();
  }

  @HostListener('drop',['$event']) onDrop(ev){

    //trip id descriptive format: 
    //vhe-trip-vhId-tripId
    //dri-trip-drId-tripId
    //cus-trip-cusId-tripId

    const tripNodeId = ev.dataTransfer.getData('elementId');
    this.dropElem = document.getElementById(tripNodeId);

    const dragType = this.dropElem.getAttribute('typedef');
    const dropType = ev.currentTarget.getAttribute('typedef');
    const refId = parseInt(this.dropElem.getAttribute('refid'),10);
    const tripId = parseInt(this.dropElem.getAttribute('tripid'),10);

    if(dragType==='cus' && dropType==='cus'){
      return;
    }
   
    if(this.dropElem!=null){
 
      // ev.target.classList.contains('time-panel') || ev.target.parentNode.classList.contains('time-panel') 
      // || ev.target.classList.contains('panel-customer-timeline') || ev.target.parentNode.classList.contains('panel-customer-timeline') 
      // let IsDropOnTrip = ev.target.parentNode.classList.contains('time-panel');

      // if(!IsDropOnTrip){
      //   IsDropOnTrip = ev.target.parentNode.classList.contains('panel-customer-timeline') ;
      // }
        
      const tripInfo = this.dataService.get_trip_info_by_classification(dragType, refId, tripId);

      if(tripInfo['status']==='colsed'){
        return;
      }

      //new version
      
      let attr = ''; 
      let dropRefId = 0;

      if(dropType==='cus'){
        dropRefId = tripInfo['customer_id'];
      }else{
        attr = (dropType==='vhe')? 'vehicle-id':'driver-id';
        dropRefId = parseInt(ev.currentTarget.getAttribute(attr),10);
      }
    
      this.currentTrips = this.dropElem.parentNode.children;

      this.has_pax_limit=false;
      this.is_overlap = false;

      this.drop_trip(tripId, dragType, dropType, dropRefId, tripInfo);

      //const tripElems = ev.target.getElementsByClassName('region-trip');
      //ev.target.appendChild(this.dropElem);
    }
    
  }

}
