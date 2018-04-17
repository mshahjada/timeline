import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { TripModalContent } from '../tripmodal/tripmodal.component';
import {Http} from '@angular/http';
import { HttpResponse } from 'selenium-webdriver/http';
import * as $ from 'jquery';
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})

export class CustomerComponent implements OnInit {

    type='cus';
    elem = null;
    tripInfo = this.dataService.getTripInfoInstance();
    marginLeft = '-1px';
    IsAscendingOrder = true;
    FilterType = 'A-Z';
    filterShift='';
    hasMouseDown = true;

    setFilterToggle(event, IsAESC): void{

      if(!IsAESC){
        event.target.parentNode.getElementsByTagName('img')[0]['src'] = this.dataService.getIcon()['ArrowUpActive'];
        event.target.parentNode.getElementsByTagName('img')[1]['src'] = this.dataService.getIcon()['ArrowDownDeactive'];
      }else{
        event.target.parentNode.getElementsByTagName('img')[0]['src'] = this.dataService.getIcon()['ArrowUpDeactive'];
        event.target.parentNode.getElementsByTagName('img')[1]['src'] = this.dataService.getIcon()['ArrowDownActive'];
      }

      this.IsAscendingOrder=IsAESC;
      this.FilterType = (this.IsAscendingOrder)?'A-Z':'Z-A';
    }

    getFilterProperty(): string{
      return (this.IsAscendingOrder)? 'customer_name':'-customer_name';
    }

    getCusTripLeft(): string{
      const elem = document.getElementById('cus-trip-timeline');
      if(elem != null && elem !== undefined){
        if(elem.clientHeight< elem.scrollHeight){
          this.marginLeft = '-2px';
        }
      }
      return this.marginLeft;
    }

    showTripType(event):void{
      const cumstomPopUp = document.getElementById('tripTypePopUp');
      this.dataService.removeCustomPopUp(cumstomPopUp);
      if(cumstomPopUp.style.display===''){
        cumstomPopUp.style.display = 'none';
      }else{
        const targetElem = (event.target.nodeName==='IMG')? event.target.parentNode: event.target;
        cumstomPopUp.style.display = '';
        cumstomPopUp.focus();
        // cumstomPopUp.style.marginTop = ((event.clientY)+ (targetElem.parentNode.offsetHeight - event.offsetY))+'px';
        // cumstomPopUp.style.marginLeft = '15%';
      }
    }

    showTimeDuration(event):void{
      const cumstomPopUp = document.getElementById('timeDurationPopUp');
      this.dataService.removeCustomPopUp(cumstomPopUp);
      if(cumstomPopUp.style.display===''){
        cumstomPopUp.style.display = 'none';
      }else{
        const targetElem = (event.target.nodeName==='IMG')? event.target.parentNode: event.target;
        cumstomPopUp.style.display = '';
        cumstomPopUp.focus();
        // cumstomPopUp.style.marginTop = ((event.clientY)+ (targetElem.parentNode.offsetHeight - event.offsetY))+'px';
        // cumstomPopUp.style.marginLeft = targetElem.offsetLeft +'px';
      }
    }

    // getTripWidth(startTime, endTime):string{
    //   return this.dataService.getTripWidth(startTime, endTime)+'%';
    // }

    // getStartPos(time): string{
    //   return this.dataService.getStartPos(time)+'%';
    // }

    getTripInfo(event, callback): void{
      const typedef = event.currentTarget.getAttribute('typedef');

      if(this.type !== typedef && typedef!==''){
        const refId = parseInt(event.currentTarget.getAttribute('refid'),10);
        const tripId = parseInt(event.currentTarget.getAttribute('tripid'),10);
    
        callback = this.modalService.open(typedef, refId, tripId);
        const obj = callback.componentInstance;
        callback.result.then((result) => {
        }, (reason) => {
        });
      }
    }

    showPanel(event): void{
      const typedef = event.currentTarget.getAttribute('typedef');
      const refId = parseInt(event.currentTarget.getAttribute('refid'),10);
      const tripId = parseInt(event.currentTarget.getAttribute('tripid'),10);

      this.dataService.showTripInfoPanel(event, typedef, refId, tripId);
    }

    hidePanel(): void{
      this.dataService.hideTripInfoPanel();
    }

    search():void{

      this.dataService.getTripInfosByQuery(true, true);
      this.dataService.hideCustomPopUp(1); // All
    }

  /*----------Hour Range Indicator---------- */

    rangeIndicator(event, IsMin):void{

        //event.target.parentNode
        const elem_tracker = document.getElementById('timetracker');

        const maxPointerMove = function(e){

          if(!elem_tracker.getAttribute('move-active')){
            return false;
          }

          const range = elem_tracker.offsetWidth - event.target.offsetWidth;
          const rangeWidth = elem_tracker.offsetWidth - 2*(event.target.offsetWidth);
          const minVal = parseFloat(elem_tracker.getAttribute('min'));
          const maxVal = parseFloat(elem_tracker.getAttribute('max'));
          const segmentvalue = (maxVal - minVal)/ rangeWidth;

          const currentOffsetLeft = event.target.offsetLeft+e.movementX;
          const currentMaxPoint = (IsMin)? event.target.nextElementSibling.offsetLeft : 0;
          const currentMinPoint = (!IsMin)? event.target.previousElementSibling.offsetLeft :0;

          let rangeVal = 0;
          if(currentMaxPoint<=currentOffsetLeft && IsMin){
            rangeVal = currentMaxPoint;
          }else if(currentMinPoint>=currentOffsetLeft && !IsMin){
            rangeVal = currentMinPoint;
          }else if(range>=currentOffsetLeft && currentOffsetLeft>0){
            rangeVal = currentOffsetLeft;
          }else if(range<currentOffsetLeft){
            rangeVal = range; 
          }

          event.target.style.marginLeft = rangeVal+'px';
          if(IsMin){
            elem_tracker.firstElementChild['style'].width = currentMaxPoint - rangeVal+'px';
            elem_tracker.firstElementChild['style'].marginLeft = rangeVal +'px';
          }else{
          elem_tracker.firstElementChild['style'].width = rangeVal - (elem_tracker.firstElementChild['offsetLeft']) +'px';
          }

          
          const rangeFrom = elem_tracker.firstElementChild['offsetLeft']*segmentvalue;
          const rangeTo = rangeFrom + elem_tracker.firstElementChild['offsetWidth']*segmentvalue;

          // const rangeFrom = parseInt((elem_tracker.firstElementChild.offsetLeft*segmentvalue).toString(),10);
          // const rangeTo = parseInt((rangeFrom + elem_tracker.firstElementChild.offsetWidth*segmentvalue).toString(),10);

          elem_tracker.setAttribute('rangefrom', rangeFrom.toString());
          elem_tracker.setAttribute('rangeto', ((maxVal<rangeTo)?maxVal:rangeTo).toString());

          event.target.setAttribute('title', parseInt(((IsMin)? rangeFrom: ((maxVal<rangeTo)?maxVal:rangeTo)).toString(),10));
        };

        const maxPointerRelease = function(e){
          if(elem_tracker.getAttribute('move-active')){
            elem_tracker.removeEventListener('mousemove', maxPointerMove);
            elem_tracker.setAttribute('move-active','false');
          }
          // elem_tracker.removeEventListener('mouseup', maxPointerRelease);
        };

        document.addEventListener('mouseup',maxPointerRelease);
        elem_tracker.addEventListener('mousemove',maxPointerMove);
    }

    mousedownmin(event):void{
      event.target.parentNode.setAttribute('move-active','true');
      this.rangeIndicator(event, true);
    }

    mousedownmax(event):void{
      event.target.parentNode.setAttribute('move-active','true');
      this.rangeIndicator(event, false);
    }

    constructor(public dataService: DataService, public modalService: TripModalContent, public http: Http) {
    }

    ngOnInit(){
      $('.track-pointer').on('mouseout',function(){
        document.getElementById('timetracker').setAttribute('move-active','false');
      });
    }

}
