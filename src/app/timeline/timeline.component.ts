import { Component, OnInit } from '@angular/core';
import { Timer } from '../model/timer';
import { DataService } from '../service/data.service';
import { Legends, Status_Color } from '../dataset';
import * as $ from 'jquery';
import * as datetimepicker from 'jquery-datetimepicker';
import * as moment from 'moment';

// import { LOCALE_ID } from '@angular/core';
// import { registerLocaleData } from '@angular/common';
// import localeNb from '@angular/common/locales/nb';
// registerLocaleData(localeNb, 'nb');

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
}) 

export class TimelineComponent implements OnInit {

  legends=Legends;
  status_color = Status_Color;
  tripInfo = null;
  timeFarame: Timer[] = [];
  timeFormat = 24;
  marginLeft = '0px';
  currentDate = this.dataService.getSelectedDate();
  IsDriverView = false;
  viewMode = 'Switch to driver view';
  elem = null;
  scale_width=1;
  filterArgsVehicle = '';
  filterArgsVehicelTrip = '';
  filterArgsVehicelCustomer = '';

  filterArgsDriver='';
  filterArgsDriverTrip='';
  filterArgsDriverCustomer = '';
  filterArgsGarageLoc = '';


  //setDriverFilter 
  /*--------------- Default Date Format For ngbDate Picker -----------------*/
  ngbDateFormat={
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth()+1,
    day: this.currentDate.getDate(),
  };

  getVehicleTripLeft(): string{
    const elem = document.getElementById('vhe-trip-timeline');
    if(elem != null && elem !== undefined){
      if(elem.clientHeight< elem.scrollHeight){
        this.marginLeft = '-1px';
      }
    }
    return this.marginLeft;
  }

  hideOverlayDisplay():void{
    this.dataService.hideOverlayDisplay();
  }



  /*------------- Switch View Mode ----------- */

  changeViewMode():void{
   this.dataService.hideCustomPopUp(2);
    this.dataService.toggleViewMode();
    this.IsDriverView = this.dataService.getViewMode();
    if(this.IsDriverView){
      this.viewMode = 'Switch to vehicle view';
    }else{
      this.viewMode = 'Switch to driver view';
    }
  }

  /*------------- Time Format & Date Selection ----------- */

  onSelect(event, view_format, value): void{
    this.dataService.viewFormat = view_format;
    this.dataService.setHourFormat(event, value);
    this.generateTimeLine();

    // update time range selector
    const timeTrackeElem = document.getElementById('timetracker');
    if(timeTrackeElem!==null){
      timeTrackeElem.setAttribute('rangefrom','0');
      timeTrackeElem.setAttribute('rangeto','0');
  
      for(let i=0; i<timeTrackeElem.childNodes.length;i++){
        if(timeTrackeElem.childNodes[i]['tagName']==='DIV'){
          timeTrackeElem.childNodes[i]['style'].width = '0px';
          timeTrackeElem.childNodes[i]['style'].marginLeft = '0px';
        } else if(timeTrackeElem.childNodes[i]['tagName']==='A'){
          timeTrackeElem.childNodes[i]['style'].marginLeft = '0px';
          timeTrackeElem.childNodes[i]['setAttribute']('title',0);
        }
      }
    }

    this.get_data();
  }

  selectToday(event, view_format, value):void{
    this.ngbDateFormat={
      year: new Date().getFullYear(),
      month: new Date().getMonth()+1,
      day: new Date().getDate(),
    };
    this.onDateChange(this.ngbDateFormat, false);
    this.onSelect(event, view_format, value);
    //this.onDateChange(this.ngbDateFormat);
  }

  onDateChange(ngbDate, issearch):void{

    this.ngbDateFormat = ngbDate;
    this.dataService.setSelectedDate(new Date(this.ngbDateFormat.year, this.ngbDateFormat.month-1, this.ngbDateFormat.day));
    this.currentDate = this.dataService.getSelectedDate();

    if(issearch){
      this.generateTimeLine();
      this.get_data();
    }
 
  }

  onDateTraverse(IsDateIncrease): void{
    if(IsDateIncrease){
      this.currentDate.setDate(this.currentDate.getDate()+1);
    }else{
      this.currentDate.setDate(this.currentDate.getDate()-1);
    }
    this.set_ngb_date(this.currentDate);
    this.onDateChange(this.ngbDateFormat, true);

  }

  set_ngb_date(dt){
    this.ngbDateFormat={
      year: dt.getFullYear(),
      month: dt.getMonth()+1,
      day: dt.getDate(),
    };
  }

  timeTraverse(){
    this.dataService.IsAnteMerediem = !this.dataService.IsAnteMerediem;
    this.generateTimeLine();
    this.get_data();
  }

  set_selected_date(event, date){
    const dt = new Date(date);
    this.ngbDateFormat={
      year: dt.getFullYear(),
      month: dt.getMonth()+1,
      day: dt.getDate(),
    };
    this.onDateChange(this.ngbDateFormat, false);
    this.onSelect(event, 'hour', 24);
  }

  /*------------- Time Line & Time Frame----------- */

  generateTimeLine():void{

    this.timeFarame=[];
    let i = 0;
    const date = new Date(this.dataService.CurrentSelectedDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    if(this.dataService.viewFormat==='hour'){
      if(this.timeFormat===12 && this.dataService.IsAnteMerediem){
        date.setHours(0);
      }else if(this.timeFormat===12 && !this.dataService.IsAnteMerediem){
        date.setHours(12);
      }else{
        date.setHours(0);
      }

      this.timeFormat = this.dataService.getHourFormat();
      for (i = 0; i < this.timeFormat; i++) {
  
        if(i>0){
          date.setHours(date.getHours()+1);
        }
  
        this.timeFarame.push({ 
          CurrentDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()), 
          Hour: date.getHours(), 
          Minute: date.getMinutes(),
          FormatterHour: this.dataService.date_part_setup(date.getHours().toString()),
          FormatterMin: this.dataService.date_part_setup(date.getMinutes().toString()),
          FormattedDate: moment(new Date(date.getFullYear(), date.getMonth(), date.getDate())).format('DD/MM/YYYY')
        });

        
      }
    }else if(this.dataService.viewFormat==='week'){
      for (i = 0; i <7; i++) {
              if(i>0){
                date.setDate(date.getDate()+1);
              }
              
              this.timeFarame.push({ 
                CurrentDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()), 
                Hour: date.getHours(), 
                Minute: date.getMinutes(),
                FormatterHour: this.dataService.date_part_setup(date.getHours().toString()),
                FormatterMin: this.dataService.date_part_setup(date.getMinutes().toString()),
                FormattedDate: moment(date).format('DD/MM/YYYY')
              });
            }
    }
  

  

  }

  getTimeSlotWidth(): string{
    if(this.dataService.viewFormat==='hour'){
      return (100/this.timeFormat)+'%';
    }else if(this.dataService.viewFormat==='week'){
      return (100/7)+'%';
    }
    
  }

  /*------------Settings------------ */

  show_settings(){
    const settings_popup = document.getElementById('settingsPopUp');
    this.dataService.removeCustomPopUp(settings_popup);
    if(settings_popup.style.display===''){
      settings_popup.style.display = 'none';
    }else{
      settings_popup.style.display = '';
      settings_popup.focus();
    }

  }

  /*----------- vehicle Filter----------- */

  showVehicleFilter(event): void{
    const cumstomPopUp = document.getElementById((this.IsDriverView)? 'driverTypePopUp' : 'vehicleTypePopUp');
    this.dataService.removeCustomPopUp(cumstomPopUp);
    if(cumstomPopUp.style.display===''){
      cumstomPopUp.style.display = 'none';
      document.getElementById('filterpopup_arrow').style.display='';
      cumstomPopUp.className =  cumstomPopUp.className.replace('active-picker','');
    }else{
      cumstomPopUp.style.display = '';
      cumstomPopUp.classList.add('active-picker');
      //cumstomPopUp.focus();
      document.getElementById('filterpopup_arrow').style.display='block';
      //cumstomPopUp.style.marginTop = ((event.clientY)+ (event.target.offsetHeight - event.offsetY))+'px';
    }
  }

  setVehicleFilter():void{
    this.dataService.setVehicleFilter(this.filterArgsVehicle);
  }


  setGarageFilter():void{
    this.dataService.setGarageLoc(this.filterArgsGarageLoc);
  }

  

  /*----------- Driver Filter -----------------*/


  setDriverFilter():void{
    this.dataService.setDriverFilter(this.filterArgsDriver);
  }

  /*----------- Customer Filter----------- */

  setVehicleTripFilter():void{
    this.dataService.setVehicleTripFilter(this.filterArgsVehicelCustomer, this.filterArgsVehicelTrip);
  }

  setDriverTripFilter():void{
    this.dataService.setDriverTripFilter(this.filterArgsDriverCustomer, this.filterArgsDriverTrip);
  }

  /*----------Select Vehicle Type---------- */
  
  selectAllVehicleType(event):void{
    const vehicleTypeElms = document.getElementById('vehicleTypePopUp').getElementsByClassName('vehicletype');  
    if(vehicleTypeElms!=null && vehicleTypeElms.length>0){
      for(let i=0; i<vehicleTypeElms.length;i++){
        vehicleTypeElms[i]['checked'] = event.target.checked;
      }
    }
  }

  selectSingleVehicleType(event):void{
    const rootType = document.getElementById('vehicleTypePopUp').getElementsByClassName('root');  
    if(rootType!=null && !event.target.checked){
      rootType[0]['checked'] = event.target.checked;
    }

    const vehicleTypeElms = document.getElementById('vehicleTypePopUp').getElementsByClassName('vehicletype');  
    if(vehicleTypeElms!=null && vehicleTypeElms.length>0){
      let count=0;
      for(let i=0; i<vehicleTypeElms.length;i++){
        if(vehicleTypeElms[i]['checked']){
          count++;
        }
      }

      if(vehicleTypeElms.length === count){
        rootType[0]['checked'] = true;
      }
    }

  }

  /*----------Select Driver Type---------- */

  selectAllDriverType(event):void{
    const driverTypeElms = document.getElementById('driverTypePopUp').getElementsByClassName('drivertype');  
    if(driverTypeElms!=null && driverTypeElms.length>0){
      for(let i=0; i<driverTypeElms.length;i++){
        driverTypeElms[i]['checked'] = event.target.checked;
      }
    }
  }

  selectSingleDriverType(event):void{
    const rootType = document.getElementById('driverTypePopUp').getElementsByClassName('root');  
    if(rootType!=null && !event.target.checked){
      rootType[0]['checked'] = event.target.checked;
    }

    const driverTypeElms = document.getElementById('driverTypePopUp').getElementsByClassName('drivertype');  
    if(driverTypeElms!=null && driverTypeElms.length>0){
      let count=0;
      for(let i=0; i<driverTypeElms.length;i++){
        if(driverTypeElms[i]['checked']){
          count++;
        }
      }

      if(driverTypeElms.length === count){
        rootType[0]['checked'] = true;
      }
    }

  }

  /*-------------- Grouping -------------- */

  vehicleTripGrouping(selectiontype):void{
    this.dataService.vehicleTripGroupView(selectiontype);
  }

  driverTripGrouping(selectiontype):void{
    this.dataService.driverTripGroupView(selectiontype);
  }


  /*------------Search -----------------------*/
  search_driver():void{
    this.dataService.getDriverTripByQuery(true, true);
    this.dataService.hideCustomPopUp(1); // All
  }

  search_vehicle():void{
    this.dataService.getVehicleTripByQuery(true, true);
    this.dataService.hideCustomPopUp(1); // All
  }

  /*--------------Zooom Option------------- */
    zoom_feature=function(event){
      const code = parseInt(event.which || event.keyCode, 10);
      //code=>43(+), 95(-), 45(-)

      if(!event['shiftKey'] || !(code===43 || code===45 || code===95)){ return; }

      const zoom_percentage = 20;
      const time_panel_root = document.getElementsByClassName('hour-segment')[0];
      const elems = document.getElementsByClassName('time-panel');
      
      let actual_width = 100;
      let pre_margin_left = 0;

      let width = time_panel_root['style'].width;
      
      width = (width==='' || width===null)? actual_width:parseInt(width,10);
      actual_width = width;
      pre_margin_left = (time_panel_root['style'].marginLeft!=null &&  time_panel_root['style'].marginLeft!=='') ? 
                        parseFloat(time_panel_root['style'].marginLeft):0;

      if(code===43){
        width += zoom_percentage;
      }else{
          if(width<=100){
          width = 100;
          }else{
          width -= zoom_percentage;
          }
      }

      const elem_timer = document.getElementById('timer-pointer-line');
      if(width===100){
        elem_timer.setAttribute('zoom-enable', 'false');
      }else{
        elem_timer.setAttribute('zoom-enable', 'true');
      }



      time_panel_root['style'].width = width+'%';
      time_panel_root['style'].marginLeft = -(width - 100)/2 +'%';

      if(elems!=null){
        for(let i=1; i<elems.length;i++){

          elems[i]['style'].width =  time_panel_root['style'].width;
          elems[i]['style'].marginLeft = time_panel_root['style'].marginLeft;
          
        }
      }
    };

    // time_panel_shift_scroll(event):void{
    //   if(!event['shiftKey']){
    //     return;
    //   }
      

    //   if(event!==undefined){
    //     if(event.target.getAttribute('client-scroll')==='true'){
    //       const actual_left = (100 * event.target.scrollLeft)/(event.target.lastElementChild.clientWidth - event.target.clientWidth);

    //       const tp = document.getElementsByClassName('timer-pointer')[0];
    //       const elems = document.getElementsByClassName('time-panel');
    //       const scroll_percentage = (event.target['scrollLeft']/event.target['scrollWidth'])*100;
    //       if(elems!=null){
    //         for(let i=0;i<elems.length;i++){
    //           elems[i]['style'].marginLeft = -(actual_left*((parseFloat(elems[i]['style'].width)-100)/100))+'%';
    //         }

    //       }
    //     }else{
    //       event.target.setAttribute('client-scroll',true);
    //     }
    //   }
    
    // }


    /*--------------Get Data------------*/

    get_data(){

        this.dataService.resetDataSet();
    
        this.dataService.getDriverTripByQuery(true, false);
    
        this.dataService.getVehicleTripByQuery(false, false);
    
        this.dataService.getTripInfosByQuery(true, true);
    }


  /* ----------Declaration------- */

    constructor(public dataService: DataService) {
      
    }

    ngOnInit() {
     
      // $('.custom-popup').on('click',function(){
      //   $(this).fadeOut(100);
      //   $('#filterpopup_arrow').fadeOut(100);
      // });

      // window.onclick = function(event) {
      //   console.log(event.target);
      // };
      
      $(document).click(function (e) {
        if (!$(e.target).hasClass('popup-selection') && $(e.target).parents('.custom-popup').length === 0) {
          $('.custom-popup').hide();
          $('#filterpopup_arrow').hide();
        }
      });
      console.log(datetimepicker);
      //$('.jdtroot').datetimepicker({format:'d/m/Y H:i', timepicker:false});
      document.addEventListener('keypress', this.zoom_feature);
      this.generateTimeLine();
   }
  
}
