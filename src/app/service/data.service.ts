import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from 'selenium-webdriver/http';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http/src/static_response';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import { debug } from 'util';
import { status_code } from '../dataset';
import { notification } from '../message/notify';
import { element } from 'protractor';


@Injectable()
export class DataService {
  //rootDirectory = 'http://172.16.228.82:8000/api';
  //rootDirectory = 'http://172.16.228.82:8000/api';
  //rootDirectory = 'http://ec2-34-242-226-210.eu-west-1.compute.amazonaws.com:8080/api';
  //rootDirectory = 'https://oslobuss-test.busgroup.no/api';
  rootDirectory = 'https://oslobuss-qa.busgroup.no/api';
  //rootDirectory = 'https://oslobuss-staging.busgroup.no/api';

  IsLocal = true;  // for local server data view & setup
  //rootDirectory = 'https://'+window.location.host+'/api';
  redirectUrl = 'https://'+window.location.host+'/opportunity';
  hostUrl = 'https://'+window.location.host+'';
  

  overlayDisplay = 'none';
  viewFormat = 'hour';
  hourFormat = 24; // default Hour Format;
  IsAnteMerediem = true;
  tripRegionWidth = 100;
  isDriverView = false;
  cumstomPopUp = null;
  IsAscendingOrder = true;

  garage_loc = '';
  vh_filter_grp = 'All';
  vehicle_name = '';
  vh_cus_name = '';
  vh_trip_no = '';

  dri_filter_grp = 'All';
  driver_name = '';
  dri_cus_name = '';
  dri_trip_no = '';
  dri_vhe_no = '';

  up_cus_name = '';
  up_shift_name = '';
  up_trip_no = '';

  FilterType = 'A-Z';
  CurrentSelectedDate = ((localStorage.getItem('start_time')!==null)? this.get_sync_time() : new Date());
  tracePoint = 0;

  //configuration
  vehicle_types=[];
  trip_types=[];
  trip_category=['Internal','Rental','External'];
  driver_categories=[];

  //new version
  vehicle_trips=[];
  default_vehicle_trips=[];
  vehicle_trip = this.getVehicleTripInstance();

  driver_trips=[];
  default_driver_trips=[];
  driver_trip = this.getDriverTripInstance();

  trip_infos=[];
  tripInfo = this.getTripInfoInstance();

  selected_period = {
    header_title: '',
    start : '',
    end : '',
    category : '',
    type : '',
    comments : ''
  };

   /*--------------- Authentication Configure ------------- */

    getRequestConfiguration():object{
      let db_name = '';
      if(this.IsLocal){
        //db_name = 'oslobuss_db';
        db_name = 'oslobuss-qa';
        //db_name = 'oslobuss-test';
        //db_name = 'oslobuss-staging';
      }else{
        const hostName = window.location.host;
        if(hostName.indexOf('.')>-1){
          db_name = hostName.split('.')[0];
        }
      }
      return { 'headers': new HttpHeaders().set('domain', db_name) };
    }

    getUserTimeZone():string{
      let tz='Europe/Oslo';
      //let tz='Asia/Dhaka';
      //let tz='Asia/Tokyo';
      if(localStorage.getItem('user_tz') !== null){
        tz = localStorage.getItem('user_tz');
      }
      return tz;
    }

    date_part_setup(str){
      if(str.length<2){
        return '0'+str;
      }else{
        return str;
      }
    }

    convertDateTimeToUserTimeZone(datetime):string{
      if(datetime!=='' && datetime != null){
        const utc_time = timezone(datetime+'Z');
        const local_time = utc_time.tz(this.getUserTimeZone());
        return local_time.format('YYYY/MM/DD HH:mm:ss');
      }else{
        return null;
      }
    }

    convert_local_time_user_utc_time(datetime):string{
      if(datetime!=='' && datetime != null){
        //Intl.DateTimeFormat().resolvedOptions().timeZone
        const year = datetime.getFullYear().toString();
        const month = this.date_part_setup((datetime.getMonth()+1).toString());
        const date = this.date_part_setup(datetime.getDate().toString());
        const hours = this.date_part_setup(datetime.getHours().toString());
        const min = this.date_part_setup(datetime.getMinutes().toString());
        const sec = this.date_part_setup(datetime.getSeconds().toString());
        const dt_format = year +'-'+ month +'-'+ date +' '+ hours +':'+ min +':'+ sec;
        return timezone.tz(dt_format, this.getUserTimeZone()).toISOString();
      }else{
        return null;
      }
    }

   /*-------------- Custom Common Function ---------------*/

    getStringJoin(objs, property:string):string{

      let res='';
      if(objs!==null && objs.length>0) {

        if(objs[0].hasOwnProperty(property) && typeof(objs[0]) === 'object'){
          for(let i=0; i<objs.length;i++){
            res += objs[i][property]+',';
          }
          res = res.substring(0, res.length-1);
          
        }else if(!objs[0].hasOwnProperty(property)){
          for(let i=0; i<objs.length;i++){
            res += objs[i]+',';
          }
          res = res.substring(0, res.length-1);
        }
      }
      return res;
    }

    errorGenerator(err):object{
      let IsOverlapped =false;
      let hasPaxError = false;
      const errors=[];
      if(err.error.hasOwnProperty('detail')){
        const properties = Object.getOwnPropertyNames(err.error['detail']);
        
        for(let i=0; i<properties.length;i++){
          const prop_errors = err.error['detail'][properties[i]];
          for(let j=0; j<prop_errors.length;j++){
            const server_msg = prop_errors[j];
            let custom_msg='';
            if(server_msg === 'A valid integer is required.'){
              custom_msg = 'Valid '+properties[i]+' required.';
              errors.push(custom_msg);
            }else if(properties[i] === 'vehicle_overlap'){
              IsOverlapped = true;
              custom_msg = notification.overlap;
              errors.push(custom_msg);
            }else if(properties[i] === 'driver_overlap'){
              custom_msg = notification.overlap;
              errors.push(custom_msg);
            }else if(properties[i] === 'pax_limit'){
              custom_msg = notification.paxlimit;
              hasPaxError = true;
              errors.push(custom_msg);
            }else{
              errors.push(server_msg);
            }
            
          }
        }
      }else if(err.error.hasOwnProperty('result')){
        errors.push(err.error['result']);
      }else{
        errors.push('Unknown error');
      }

  
      return { Errors:errors,  IsOverlapped: IsOverlapped, hasPaxError: hasPaxError} ;
    }

   /*---------------- set global info ---------------*/

    getZoomWidth():string{
      const time_panel = document.getElementsByClassName('time-panel hour-segment')[0];
      let zoom_width = '';
      if(time_panel.hasAttribute('style')){
        zoom_width = time_panel['style'].width;
      }
      return zoom_width;
    }

    getZoomLeft():string{
      const time_panel = document.getElementsByClassName('time-panel hour-segment')[0];
      let left_margin = '';
      if(time_panel.hasAttribute('style')){
        left_margin = time_panel['style'].marginLeft;
      }
      return left_margin;
    }

    toggleViewMode():void{
      this.isDriverView = !this.isDriverView;
      this.IsAscendingOrder = true;
      this.FilterType = (this.IsAscendingOrder)?'A-Z':'Z-A';
    }

    setSelectedDate(date: Date):void{
      this.CurrentSelectedDate = date;
    }

    setHourFormat(event, val): void{

      if(this.viewFormat==='week'){
        val = 24*7;
      }

      this.hourFormat = val;
      this.IsAnteMerediem = true;
      const elems = event.target.parentNode.getElementsByTagName('a');
      if(elems!==null && elems.length>0){
        for(let i=0; i<elems.length;i++){
          if(elems[i].classList.contains('time-format') && elems[i].classList.contains('active')){
            elems[i].className = elems[i].className.replace('active', '');
          }
        }
        event.target.classList.add('active');
      }
    
    }

    setTripRegionWidth(width:number):void{
      this.tripRegionWidth = width;
    }

    setDefaultTimePanel():void{
      //document.getElementById('region-custom-scroll').style.display='none';
      // const elems = document.getElementsByClassName('hour-segment');
      // if(elems!==null){
      //   for(let i=0; i<elems.length;i++){
      //     elems[i]['style'].width =  '100%';
      //     elems[i]['style'].marginLeft =  '';
      //   }
      // }
    }

    setFilterToggle(event, IsAESC): void{

      if(!IsAESC){
        event.target.parentNode.getElementsByTagName('img')[0]['src'] = this.getIcon()['ArrowUpActive'];
        event.target.parentNode.getElementsByTagName('img')[1]['src'] = this.getIcon()['ArrowDownDeactive'];
      }else{
        event.target.parentNode.getElementsByTagName('img')[0]['src'] = this.getIcon()['ArrowUpDeactive'];
        event.target.parentNode.getElementsByTagName('img')[1]['src'] = this.getIcon()['ArrowDownActive'];
      }
     
      //this.IsAscendingOrder=!this.IsAscendingOrder;
      this.IsAscendingOrder=IsAESC;
      this.FilterType = (this.IsAscendingOrder)?'A-Z':'Z-A';
    }

    getDriverFilterProperty(): string{
      return (this.IsAscendingOrder)? 'name':'-name';
    }

    getVehicleFilterProperty(): string{
      return (this.IsAscendingOrder)? 'garage':'-garage';
    }

    getVehicleFilter():string{
      return this.vehicle_name;
    }

    setVehicleFilter(data):void{
      this.vehicle_name = data;
    }

    setGarageLoc(data):void{
      this.garage_loc = data;
    }

    setDriverFilter(data):void{
      this.driver_name = data;
    }

    getDriverFilter():string{
      return this.driver_name;
    }

    setVehicleTripFilter(cus_name, trip_no):void{

      this.vh_cus_name = cus_name;
      this.vh_trip_no = trip_no;

      const temp_vehicles=[];
      let temp_trips=[];

      if(cus_name==='' && trip_no===''){
        this.vehicle_trips = this.default_vehicle_trips;
      }else{
        for(let i=0; i<this.default_vehicle_trips.length;i++){
          temp_trips=[];
          for(let j=0; j<this.default_vehicle_trips[i].trips.length;j++){
            if(
              this.default_vehicle_trips[i].trips[j]['customer_name'].toUpperCase().indexOf(cus_name.toUpperCase())>-1
              &&
              this.default_vehicle_trips[i].trips[j]['name'].toUpperCase().indexOf(trip_no.toUpperCase())>-1){
              temp_trips.push(this.default_vehicle_trips[i].trips[j]);
            }
          }
          if(temp_trips.length>0){
            //this.default_vehicle_trips[i].trips = temp_trips;
            const vh_trip = Object.create(this.default_vehicle_trips[i]);
            vh_trip['trips'] = temp_trips;
            temp_vehicles.push(vh_trip);
          }
        }
        this.vehicle_trips = temp_vehicles;
      }
      
    }

    setDriverTripFilter(cus_name, trip_no):void{
      this.dri_cus_name = cus_name;
      this.dri_trip_no = trip_no;

      const temp_drivers=[];
      let temp_trips=[];

      if(cus_name==='' && trip_no===''){
        this.driver_trips = this.default_driver_trips;
      }else{
        for(let i=0; i<this.default_driver_trips.length;i++){
          temp_trips=[];
          for(let j=0; j<this.default_driver_trips[i].trips.length;j++){
            if(this.default_driver_trips[i].trips[j]['customer_name'].toUpperCase().indexOf(cus_name.toUpperCase())>-1
            &&
            this.default_driver_trips[i].trips[j]['name'].toUpperCase().indexOf(trip_no.toUpperCase())>-1
          ){
              temp_trips.push(this.default_driver_trips[i].trips[j]);
           }
          }
          if(temp_trips.length>0){
            const dri_trip = Object.create(this.default_driver_trips[i]);
            dri_trip['trips'] = temp_trips;
            temp_drivers.push(dri_trip);
          }
        }
        this.driver_trips = temp_drivers;
      }
    }

    hideOverlayDisplay(){
      this.overlayDisplay='none';
    }

    visibleOverlayDisplay(){
      this.overlayDisplay='block';
    }

   /*---------------- get global search param info-------------------*/

    valid_date_pattern(dt_str):string {
      const arr=dt_str.split('/');
      if(arr.length===3){
        return arr[1]+'/'+arr[0]+'/'+arr[2];
      }else{
        return '';
      }
    }

    set_trip_time(clinet_obj, response_obj){
      // clinet_obj['time_a'] = response_obj['withdrawal_time'];
      // clinet_obj['time_b1'] = response_obj['start_arrive_time'];
      // clinet_obj['time_b2'] = response_obj['start_departure_time'];
      // clinet_obj['time_c1'] = response_obj['end_arrive_time'];
      // clinet_obj['time_c2'] = response_obj['end_departure_time'];
      // clinet_obj['time_d'] = response_obj['deliver_time'];

      clinet_obj['time_a'] = response_obj['time_a'];
      clinet_obj['time_b1'] = response_obj['time_b1'];
      clinet_obj['time_b2'] = response_obj['time_b2'];
      clinet_obj['time_c1'] = response_obj['time_c1'];
      clinet_obj['time_c2'] = response_obj['time_c2'];
      clinet_obj['time_d'] = response_obj['time_d'];

      return clinet_obj;
    }

    getOverlayDisplay():string{
      return this.overlayDisplay;
    }

    getViewMode(): boolean{
      return this.isDriverView;
    }

    getSelectedDate(): Date{
      return this.CurrentSelectedDate;
    }

    getTimeRange():object{
      let timeFrom=0; let timeTo=0;
      const timerElem = document.getElementById('timetracker');
      if(timerElem!==null){
        timeFrom = parseInt(timerElem.getAttribute('rangefrom'),10);
        timeTo = parseInt(timerElem.getAttribute('rangeto'),10);
      }
      return {rangeFrom: timeFrom, rangeTo: timeTo};
    }

    getHourFormat(): number{
      return this.hourFormat;
    }

    getTimeElaspedInSec():number{

      let timeElaspedInSec = -1;
      const dt=new Date();
      
      const select_dt = new Date(this.CurrentSelectedDate.getFullYear(), 
      this.CurrentSelectedDate.getMonth(), this.CurrentSelectedDate.getDate());

      const current_dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

      const dt_to = new Date(select_dt);
      dt_to.setHours(this.hourFormat);

      if(select_dt.getTime()===current_dt.getTime()){
        let curHour = dt.getHours();
        const curMin = dt.getMinutes();
        const curSecond = dt.getSeconds();
        if(this.hourFormat===12 && !this.IsAnteMerediem){
          if(curHour>=12){
            curHour = curHour-12;
          }else {
            curHour = 0;
          }
        }
        timeElaspedInSec = (curHour*60*60)+(curMin*60)+curSecond;
      }else if(current_dt.getTime()>=select_dt.getTime()  && dt_to.getTime()>=current_dt.getTime()){

        const no_of_days = this.getDateDiff(select_dt, current_dt);
        timeElaspedInSec = (no_of_days*24*60*60) + (dt.getHours()*60*60) + (dt.getMinutes()*60)+dt.getSeconds();

      }
      return timeElaspedInSec;
    }

    getFormatTimeInSec():number{
      return this.getHourFormat()*60*60;
    }

    getSelectedTripType(): string[]{
      const triptypes: string[]=[];
      const parentNode = document.getElementById('tripTypePopUp');
      if(parentNode!=null){
        const tripElems = parentNode.getElementsByTagName('input');
          if(tripElems!==null && tripElems.length>0){
            for(let i=0; i<tripElems.length;i++){
              if(tripElems[i].checked){
                triptypes.push(tripElems[i].getAttribute('triptype'));
              }
            }
          }else{
            for(let i=0; i<this.trip_types.length;i++){
              triptypes.push(this.trip_types[i]['id'].toString());
            }
          }
      }
      return triptypes;
    }

    getSelectedTripCategory():string[]{
      const t_types: string[]=[];
      for(let i=0; i<this.trip_category.length;i++){
        t_types.push(this.trip_category[i].toUpperCase());
      }
      return t_types;
    }

    getSelectedVehicleType(): string[]{
      const vtypes: string[]=[];
      const vehicleElems = document.getElementById('vehicleTypePopUp').getElementsByClassName('vh-type-selector');

      if(vehicleElems!==null && vehicleElems.length>0){
        for(let i=0; i<vehicleElems.length;i++){
          if(vehicleElems[i]['checked']){
            vtypes.push(vehicleElems[i].getAttribute('data-vtype'));
          }
        }
      }else{
        for(let i=0; i<this.vehicle_types.length;i++){
          vtypes.push(this.vehicle_types[i]['id'].toString());
        }
      }
      return vtypes;
    }

    getSelectedVehicleTripType(): string[]{
      const t_types: string[]=[];
      const trip_type_elems = document.getElementById('vehicleTypePopUp').getElementsByClassName('trip-vh-selector');
      if(trip_type_elems!==null && trip_type_elems.length>0){
        for(let i=0; i<trip_type_elems.length;i++){
          if(trip_type_elems[i]['checked']){
            t_types.push(trip_type_elems[i].getAttribute('triptype'));
          }
        }
      }else{
        for(let i=0; i<this.trip_types.length;i++){
          t_types.push(this.trip_types[i]['id'].toString());
        }
      }
      return t_types;
    }

    getSelectedVehicleTripCategory(): string[]{
      const t_types: string[]=[];
      const trip_type_elems = document.getElementById('vehicleTypePopUp').getElementsByClassName('trip-vh-cat-selector');
      if(trip_type_elems!==null && trip_type_elems.length>0){
        for(let i=0; i<trip_type_elems.length;i++){
          if(trip_type_elems[i]['checked']){
            t_types.push(trip_type_elems[i].getAttribute('trip-cat').toUpperCase());
          }
        }
      }else{
        for(let i=0; i<this.trip_category.length;i++){
          t_types.push(this.trip_category[i].toUpperCase());
        }
      }
      return t_types;
    }

    getSelectedDriverType(): string[]{
          const drivertypes: string[]=[];
          const driverElems = document.getElementById('driverTypePopUp').getElementsByClassName('drivertype');
      
          if(driverElems!==null && driverElems.length>0){
            for(let i=0; i<driverElems.length;i++){
              if(driverElems[i]['checked']){
                drivertypes.push(driverElems[i].getAttribute('drivertype').toUpperCase());
              }
            }
          }else{
            for(let i=0; i<this.driver_categories.length;i++){
              drivertypes.push(this.driver_categories[i]['id'].toString());
            }
          }
          return drivertypes;
    }

    getSelectedDriverAvailability(): string[]{
      const driverAvailability: string[]=[];
      const availabilityElems = document.getElementById('driverTypePopUp').getElementsByClassName('driver-availability');

      if(availabilityElems!==null){
        for(let i=0; i<availabilityElems.length;i++){
          if(availabilityElems[i]['checked']){
            driverAvailability.push(availabilityElems[i].getAttribute('availability'));
          }
        }
      }
      // if(driverAvailability.length===0){
      //   driverAvailability=['Free', 'Driving'];
      // }
      return driverAvailability;
    }

    getSelectedDriverTripType(): string[]{
      const t_types: string[]=[];
      const trip_type_elems = document.getElementById('driverTypePopUp').getElementsByClassName('trip-dri-selector');

      if(trip_type_elems!==null && trip_type_elems.length>0){
        for(let i=0; i<trip_type_elems.length;i++){
          if(trip_type_elems[i]['checked']){
            t_types.push(trip_type_elems[i].getAttribute('triptype'));
          }
        }
      }else{
        for(let i=0; i<this.trip_types.length;i++){
          t_types.push(this.trip_types[i]['id'].toString());
        }
      }
      return t_types;
    }

    getSelectedDriverTripCategory(): string[]{
      const t_types: string[]=[];
      const trip_type_elems = document.getElementById('driverTypePopUp').getElementsByClassName('trip-dri-cat-selector');

      if(trip_type_elems!==null && trip_type_elems.length>0){
        for(let i=0; i<trip_type_elems.length;i++){
          if(trip_type_elems[i]['checked']){
            t_types.push(trip_type_elems[i].getAttribute('trip-cat').toUpperCase());
          }
        }
      }else{
        for(let i=0; i<this.trip_category.length;i++){
          t_types.push(this.trip_category[i].toUpperCase());
        }
      }
      return t_types;
    }


    getGlobalSearhObject(): object{
      const timeRange = this.getTimeRange();
      const date = this.CurrentSelectedDate;
      const dateFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateTo =  new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if(this.hourFormat===12){
        if(this.IsAnteMerediem){
          dateTo.setHours(dateFrom.getHours()+this.hourFormat);
        }else{
          dateFrom.setHours(dateFrom.getHours()+this.hourFormat);
          dateTo.setDate(dateTo.getDate()+1);
        }
      }else if(this.hourFormat === 24){
        dateTo.setDate(dateFrom.getDate()+1);
      }else if(this.hourFormat === 48){
        dateTo.setDate(dateFrom.getDate()+2);
      }else if(this.hourFormat > 48 && this.viewFormat==='week'){
        dateTo.setDate(dateFrom.getDate()+7);
      }

      const obj= {
        view_mode : (this.isDriverView)? 'dri' : 'vhe',
        date_from : this.convert_local_time_user_utc_time(dateFrom).split('.')[0],
        date_to : this.convert_local_time_user_utc_time(dateTo).split('.')[0],
        
        vh_type : this.getStringJoin(this.getSelectedVehicleType(), ''),
        vh_trip_type : this.getStringJoin(this.getSelectedVehicleTripType(), ''),
        vh_trip_cat : this.getStringJoin(this.getSelectedVehicleTripCategory(), ''),
        vh_filter_grp: this.vh_filter_grp.toUpperCase(),
        vehicle_name : this.vehicle_name,
        vh_cus_name : this.vh_cus_name,

        driver_type : this.getStringJoin(this.getSelectedDriverType(), ''),
        driver_status : this.getStringJoin(this.getSelectedDriverAvailability(), ''),
        dri_trip_type : this.getStringJoin(this.getSelectedDriverTripType(), ''),
        dri_trip_cat : this.getStringJoin(this.getSelectedDriverTripCategory(), ''),
        dri_filter_grp: this.dri_filter_grp.toUpperCase(),
        driver_name : this.driver_name,
        dri_cus_name : this.dri_cus_name,

        garage_loc : this.garage_loc,

        up_trip_type : this.getStringJoin(this.getSelectedTripType(), ''),
        up_trip_category: this.getStringJoin(this.getSelectedTripCategory(), ''),
        duration_from : timeRange['rangeFrom'],
        duration_to : timeRange['rangeTo'],
        up_cus_name : this.up_cus_name,
        up_shift_name : this.up_shift_name,
        up_trip_no : this.up_trip_no
      };

      localStorage.setItem('trip_type', ((!this.isDriverView)? obj['vh_trip_type']:obj['dri_trip_type']));
      localStorage.setItem('trip_owner_type', ((!this.isDriverView)? obj['vh_trip_cat']:obj['dri_trip_cat']));
      localStorage.setItem('start_time', moment(dateFrom).format('DD/MM/YYYY'));
      localStorage.setItem('end_time', moment(dateTo).format('DD/MM/YYYY'));

      return obj;
    }

    getAirportSymbol(IsInformed):string{
      if(IsInformed){
        return  this.getIcon()['FlightGreen'];
      }else{
        return this.getIcon()['FlightRed'];
      }
    }

    /*-------------------- Custom Modal Open/ Close------------------*/

    hideCalender(){
      //d-inline-block rounded dropdown-menu ngbdatepicker
      const elems = document.getElementsByTagName('ngb-datepicker');
      if(elems!=null && elems.length>0){
        elems[0].parentNode.removeChild(elems[0]);
      }
    }

    hideCustomPopUp(param:number):void{
      const popupElems = document.getElementsByClassName('custom-popup');
      if(popupElems!==null  && popupElems.length>0){
        const picker_arrow = document.getElementById('filterpopup_arrow');
        if(picker_arrow!=null){
          picker_arrow['style'].display = 'none';
        }

        if(param===1){
          for(let i=0; i<popupElems.length;i++){
            popupElems[i]['style'].display='none';
          } 
        }else if(param===2){
          for(let i=0; i<popupElems.length;i++){
            if(popupElems[i].classList.contains('section-primary')){
              popupElems[i]['style'].display='none';
            }
          } 
        }else if(param===3){
          for(let i=0; i<popupElems.length;i++){
            if(popupElems[i].classList.contains('section-secondary')){
              popupElems[i]['style'].display='none';
            }
          } 
        }
        
      }
    }

    removeCustomPopUp(elem):void{
      const popupElems = document.getElementsByClassName('custom-popup');
      if(popupElems!==null  && popupElems.length>0){
        for(let i=0; i<popupElems.length;i++){
          if(elem!==null && elem['id']!==popupElems[i].id){
            popupElems[i]['style'].display='none';
          }
        }
      }
    }


    show_popup(event, elementId){
     //Sub Menu From Base UI
      let base_height = 0;
      let submenu_width = 0;
      if(!this.IsLocal){
        base_height = 83;
        const submenu = document.getElementsByClassName('drawer');
        if(submenu!=null && submenu.length>0){
          if(submenu[0].classList.contains('open')){
            submenu_width = parseFloat(submenu[0]['offsetWidth']);
          }else{
            submenu_width = parseFloat(submenu[0]['offsetWidth']);
          }
        }
      }
     
      const rootElem = document.getElementById('panel-time-schedule');
      this.cumstomPopUp = document.getElementById(elementId);
      this.cumstomPopUp.style.display = '';

      const popupWidth = (elementId === 'periodical-popup')? 180 : 300;
      const popupHeight = 200;

 
      const actualWidth =  event.target.parentNode.parentNode.offsetWidth + 
                           event.target.parentNode.parentNode.previousElementSibling.offsetWidth;
      const actualHeight = rootElem.offsetHeight; 

      const posLeft = event.clientX;

      const posTop = ((event.clientY)+ (event.target.offsetHeight - event.offsetY));


      if((posTop + popupHeight) > actualHeight){
        this.cumstomPopUp.style='';
        this.cumstomPopUp.style.position = 'absolute';
        this.cumstomPopUp.style.bottom = (actualHeight - posTop + base_height + ((this.IsLocal)?30:20) )+'px' ;
        this.cumstomPopUp.style.marginTop = '0px';
      }else{
        this.cumstomPopUp.style='';
        this.cumstomPopUp.style.marginTop = ((posTop - base_height) + ((this.IsLocal)?0:10))+'px';
        this.cumstomPopUp.style.bottom = 'none';
      }
      this.cumstomPopUp.style.marginLeft = ((((posLeft + popupWidth) > actualWidth)? (actualWidth -popupWidth ) : posLeft) 
      - submenu_width) +'px';
    }

    showTripInfoPanel(event, type, refId, tripId): void{

      this.show_popup(event, 'tripPopup');
      if(type==='vhe'){
        this.tripInfo = this.getVehicleTrip(refId, tripId);
      }else if(type==='dri'){
        this.tripInfo = this.getDriverTrip(refId, tripId);
      }else{
        this.tripInfo = this.getTripInfo(tripId);
      }

    }

    hideTripInfoPanel(): void{
      document.getElementById('tripPopup').style.display = 'none';
    }

    hide_activity_panel(): void{
      document.getElementById('periodical-popup').style.display = 'none';
    }
    
    
    /*---------------------- generate trip region width ----------------*/

    WithScrollLeft(type){
      const elem = document.getElementById(type+'-trip-timeline');
      if(elem != null && elem['scrollHeight']>elem['clientHeight']){
        return '6px';
      }else{
        return '0px';
      }
    }

    getDateDiff(dtFrom, dtTo){
      //console.log(dtFrom, dtTo);
      dtFrom = new Date(dtFrom.getFullYear(), dtFrom.getMonth(), dtFrom.getDate());
      dtTo = new Date(dtTo.getFullYear(), dtTo.getMonth(), dtTo.getDate());
      const diff_in_days = (dtTo - dtFrom)/(1000*3600*24);
      return diff_in_days;
    }

    getTimeDiff(startTime, endTime):number{
      const time_diff = (endTime-startTime)/(1000*60); // In minute
      return time_diff;
    }


    getDateFrom():Date{
      const tdate = this.CurrentSelectedDate;
      const dt = new Date(tdate.getFullYear(), tdate.getMonth(), tdate.getDate());

      if(this.hourFormat===12 && !this.IsAnteMerediem){
        dt.setHours(12);
      }
      return dt; 
    }

    getDateTo():Date{
      const tdate=this.getDateFrom();
      tdate.setHours(this.hourFormat);
      // if(this.hourFormat===48){
      //   tdate.setDate(tdate.getDate()+1);
      // }
      tdate.setMinutes(tdate.getSeconds()-1);
      return tdate;
    }

    getDatePart(date):Date{
      date = new Date(date);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    getDateRangeFrom(startDateTime):Date{
      startDateTime = new Date(startDateTime);
      if(this.getDateFrom()>startDateTime){
        startDateTime = this.getDateFrom();
      }
      return startDateTime;
    }

    getDateRangeTo(endDateTime):Date{
      endDateTime = new Date(endDateTime);
      const from_date = this.getDateFrom();
      const to_date = this.getDateTo();
      if(this.getDatePart(endDateTime)>to_date){
        endDateTime = to_date;
      }else if(from_date>endDateTime){
        endDateTime = from_date;
      }
      return endDateTime;
    }

    InTimeRange(startTime):boolean{
      return false;
    }

    getTripWidth(type, startTime1, startTime2, endTime1, endTime2):string{

      const startTime = this.getDateRangeFrom((startTime1===null)? startTime2: startTime1);
      const endTime = this.getDateRangeTo((endTime2===null)? endTime1: endTime2);
      const time_diff = this.getTimeDiff(startTime, endTime); // In minute

      const actual_width = (this.tripRegionWidth*time_diff)/(this.hourFormat*60);
      return 'calc('+ ((actual_width>0)? actual_width +'%' : '2px') +' + '+ ((actual_width>0)? this.WithScrollLeft(type): '0px') +')';
    }

    getStartPos(time1, time2): string{

      const time = this.getDateRangeFrom((time1===null)? time2: time1);
      const no_of_days = this.getDateDiff(this.CurrentSelectedDate, time);
      let cur_hr=0;
      let cur_min = 0;
      if(this.hourFormat===12 && !this.IsAnteMerediem){
        if(time.getHours()>=this.hourFormat){
          cur_hr = time.getHours() - this.hourFormat;
          cur_min = time.getMinutes();
        }
      }else{
        cur_hr = time.getHours();
        cur_min = time.getMinutes();
      }
      const hours = (no_of_days*24) + cur_hr;
      const minutes = cur_min;
      return (this.tripRegionWidth*((hours*60)+minutes))/(this.hourFormat*60)+'%';

    }

    getTripSolidWidth(startTime1, startTime2, endTime1, endTime2):string{
      
        startTime1 = this.getDateRangeFrom(new Date((startTime1===null)? startTime2: startTime1)); 
        endTime2 = this.getDateRangeTo(new Date((endTime2===null)? endTime1: endTime2));

        startTime2 = this.getDateRangeFrom(startTime2); 
        endTime1 = this.getDateRangeTo(endTime1);

        const timeDuration = this.getTimeDiff(startTime1, endTime2);
        const time_diff = this.getTimeDiff(startTime2, endTime1); // In minute
        return this.getTripSectionWidth(startTime2, endTime1, timeDuration)+'%';
    
    }

    getTripStripWidth(bStart, startTime1, startTime2, endTime1, endTime2):string{
      if(startTime1!=null && bStart){
        startTime1 = this.getDateRangeFrom(new Date(startTime1)); 
        endTime2 = this.getDateRangeTo(new Date((endTime2===null)? endTime1: endTime2));

        startTime2 = this.getDateRangeFrom(new Date(startTime2)); 
        const timeDuration = this.getTimeDiff(startTime1, endTime2);
        return this.getTripSectionWidth(startTime1, startTime2, timeDuration)+'%';

      }else if(endTime2!=null && !bStart){
        startTime1 = this.getDateRangeFrom(new Date((startTime1===null)? startTime2: startTime1));
        endTime2 = this.getDateRangeTo(new Date(endTime2)); 

        endTime1 = this.getDateRangeTo(new Date(endTime1));
        const timeDuration = this.getTimeDiff(startTime1, endTime2);
        return this.getTripSectionWidth(endTime1, endTime2, timeDuration)+'%';
      }else{
        return '0%';
      }
    }

    getTripSectionWidth(startTime, endTime, timeDurationInMinute): number{
      startTime = new Date(startTime);
      endTime = new Date(endTime);
      
      const time_diff = this.getTimeDiff(startTime, endTime); // In minute
      return (this.tripRegionWidth*time_diff)/(timeDurationInMinute);
    }

    getStripBackground(rotation, color):string{

      if(color==='#00c400'){
        return 'repeating-linear-gradient(135deg, rgb(10, 156, 5), rgb(10, 156, 5) 2px, rgb(0, 196, 0) 2px, rgb(0, 196, 0) 6px';
      }else{
        return 'repeating-linear-gradient('+rotation+'deg, '+this.LightenDarkenColor(color, -20)+' , '+this.LightenDarkenColor(color, -20)
        +' 2px, '+color+' 2px, '+color+' 6px)';
      }

    }  

    LightenDarkenColor(col, amt) {
      
        let usePound = false;
      
        if (col[0] === '#') {
            col = col.slice(1);
            usePound = true;
        }
     
        const num = parseInt(col,16);
     
        let r = (num >> 16) + amt;
     
        if (r > 255){
          r = 255;
        }else if(r < 0){
          r = 0;
        }  
     
        let b = ((num >> 8) & 0x00FF) + amt;
     
        if (b > 255){
          b = 255;
        } else if  (b < 0){
          b = 0;
        } 
     
        let g = (num & 0x0000FF) + amt;
     
        if (g > 255){
          g = 255;
        } else if (g < 0){
          g = 0;
        } 
     
        return ( usePound? '#':'') + (g | (b << 8) | (r << 16)).toString(16);
      
    }

    notifyRegionStart(time){
      return this.getStartPos(time, time);
    }

    notifyRegionWidth(type, timeStart, timeEnd){
      return this.getTripWidth(type, timeStart, timeStart, timeEnd, timeEnd);
    }

    getUnplannedTripBackground(vehicle_id, driver_id):string{
      let bg_color='';
      if(vehicle_id>0 || driver_id>0){
        bg_color = this.getColorCode()['lightblue']; // skyblue
      }else{
        bg_color = this.getColorCode()['grey']; //grey
      }
      return bg_color;

    }

    
    /*---------------------- get trip info  ----------------------*/

    get_trip_info_by_classification(type, refId, tripId){
      let obj=null;
      if(type==='vhe'){
        obj = this.getVehicleTrip(refId, tripId);
      }else if(type==='dri'){
        obj = this.getDriverTrip(refId, tripId);
      }else{
        obj = this.getTripInfo(tripId);
      }
      return obj;
    }

    /*---------------------- region vehicle & trip types ----------------------*/

    resetDataSet(){
      for(let i=0; i<this.driver_trips.length;i++){
        this.driver_trips[i]['trips']=[];
      }

      for(let i=0; i<this.vehicle_trips.length;i++){
        this.vehicle_trips[i]['trips']=[];
      }
      this.setTripInfo([]);
    }

    getVehicleTypes(){
      return this.vehicle_types;
    }

    getDriverCategory(){
      return this.driver_categories;
    }

    getTripTypes(){
      return this.trip_types;
    }

    getTripCategory(){
      return this.trip_category;
    }

    /*---------------- Customer Trip Info ----------------- */


    tripTrimeConversion(trip):object{
      return this.tripUTCTimetoUserZoneTime([trip])[0];
    }

    tripUTCTimetoUserZoneTime(trips):object[]{
      if(trips!=null && trips.length>0){
        for(let i=0; i<trips.length;i++){

          trips[i] = this.set_preference_color(trips[i]);

          if(trips[i].hasOwnProperty('time_a') && trips[i]['time_a']!==null && trips[i]['time_a']!==''){
            trips[i]['time_a'] = this.convertDateTimeToUserTimeZone(trips[i]['time_a']);
          }
          if(trips[i].hasOwnProperty('time_b1') && trips[i]['time_b1']!==null && trips[i]['time_b1']!==''){
            trips[i]['time_b1'] = this.convertDateTimeToUserTimeZone(trips[i]['time_b1']);
          }
          if(trips[i].hasOwnProperty('time_b2') && trips[i]['time_b2']!==null && trips[i]['time_b2']!==''){
            trips[i]['time_b2'] = this.convertDateTimeToUserTimeZone(trips[i]['time_b2']);
          }
          if(trips[i].hasOwnProperty('time_c1') && trips[i]['time_c1']!==null && trips[i]['time_c1']!==''){
            trips[i]['time_c1'] = this.convertDateTimeToUserTimeZone(trips[i]['time_c1']);
          }
          if(trips[i].hasOwnProperty('time_c2') && trips[i]['time_c2']!==null && trips[i]['time_c2']!==''){
            trips[i]['time_c2'] = this.convertDateTimeToUserTimeZone(trips[i]['time_c2']);
          }
          if(trips[i].hasOwnProperty('time_d') && trips[i]['time_d']!==null && trips[i]['time_d']!==''){
            trips[i]['time_d'] = this.convertDateTimeToUserTimeZone(trips[i]['time_d']);
          }

        }
      }
      return trips;
    }

    timePeriodUTCTimetoUserZoneTime(data):object[]{
      if(data!=null && data.length>0){
        for(let i=0; i<data.length;i++){

          if(data[i].hasOwnProperty('start') && data[i]['start']!==null && data[i]['start']!==''){
            data[i]['start'] = this.convertDateTimeToUserTimeZone(data[i]['start']);
          }
          if(data[i].hasOwnProperty('end') && data[i]['end']!==null && data[i]['end']!==''){
            data[i]['end'] = this.convertDateTimeToUserTimeZone(data[i]['end']);
          }
        }
      }
      return data;
    }


    /*--------------------------Get Trip Info--------------- */

    setTripInfo(data):void{
      this.trip_infos = this.tripUTCTimetoUserZoneTime(data);
      this.trip_infos = data;
    }

    getTripInfosByQuery(IsloaderOpen, IsloaderClose) {

      const obj = this.getGlobalSearhObject();
      const api=this.rootDirectory+'/operations/timeline/customer/?trip_type='+obj['up_trip_type']+
      '&from_date='+obj['date_from']+
      '&to_date='+obj['date_to']+
      '&start_duration='+obj['duration_from']+
      '&end_duration='+obj['duration_to']+
      '&shift_name='+obj['up_shift_name']+
      '&customer_name='+obj['up_cus_name']+
      '&shift_name='+obj['up_shift_name']+
      '&trip_category='+obj['up_trip_category']+
      '&trip_name='+ obj['up_trip_no']+
      '&view='+obj['view_mode'];

      if(IsloaderOpen){
        this.visibleOverlayDisplay();
      }
      this.http.get(api, this.getRequestConfiguration()).subscribe(res => {
         if(IsloaderClose){
          this.hideOverlayDisplay();
         }
         this.setTripInfo(res);
      },
      (err: HttpErrorResponse) => {
        if(IsloaderClose){
          this.hideOverlayDisplay();
         }
      });

    }

    getTripInfos(): object[]{
      return  this.trip_infos;
    }

    getTripInfo(tripId:number):object{
      let obj = null;
      for(let i=0; i<this.trip_infos.length; i++){
        if(this.trip_infos[i]['trip_id']===tripId){
          obj = this.trip_infos[i];
          break;
        }
      }
      return obj;
    }

    getTripInfoInstance(): object{
      return{
        airport_mail_sent : false,
        color : '',
        customer_id : 0,
        customer_name : '',
        contact_person_name: '',
        contact_person_mobile: '',
        driver_id : '',
        driver_name : '',
        image_path : '',
        loc_from : '',
        loc_to : '',
        name : '',
        pax : 0,
        price : 0,
        sale_order:'',
        shift: '',
        status : '',
        time_a : new Date(),
        time_b1 : new Date(),
        time_b2 : new Date(),
        time_c1 : new Date(),
        time_c2 : new Date(),
        time_d : new Date(),
        trip_id : 0,
        trip_status : '',
        trip_type : '',
        vehicle_id : 0,
        flight_number : '',
        group_reference : ''
      };
    }

    getCurrentTripInfo(): object{
      this.tripInfo = (this.tripInfo===null)? this.getTripInfoInstance(): this.tripInfo;
      return this.tripInfo;
    }

    removeTrip(tripId:number):void{
      for(let i=0;i<this.trip_infos.length;i++){
        if(this.trip_infos[i].trip_id === tripId){
          this.trip_infos.splice(i,1); 
          break;
        }
      }
    }

    addTrip(trip: object):void{ 
      this.trip_infos.push(trip);
    }

    /*---------------- Vehicle Trip Info ----------------- */

    vehicleTripGroupView(selection_type):void{
      
      this.vh_filter_grp = selection_type;

      if(selection_type === 'All'){
        this.vehicle_trips = this.default_vehicle_trips;
      }else{
        const withTrips=[];
        const withoutTrips=[];
        for(let i=0; i<this.default_vehicle_trips.length;i++){
          if(this.default_vehicle_trips[i].trips.length>0){
            withTrips.push(this.default_vehicle_trips[i]);
          }else{
            withoutTrips.push(this.default_vehicle_trips[i]);
          }
        }
        if(selection_type === 'Assigned'){
          this.vehicle_trips = withTrips;
        }else if(selection_type === 'Unassigned'){
          this.vehicle_trips = withoutTrips;
        }  
      }
    }

    getVehicleTripInstance(): object{
      return{
        vehicle_id: 0,
        code: 0,
        name: '',
        type: 0,
        min_capacity: 0,
        max_capacity: 0,
        trips:[]
      };
    }

    setVehicleTrips(data):void{
      for(let i=0; i<data.length;i++){
        if(data[i].trips.length>0){
          data[i].trips = this.tripUTCTimetoUserZoneTime(data[i].trips);
        }
        if(data[i].hasOwnProperty('maintenance_periods') && data[i].maintenance_periods.length>0){
          data[i].maintenance_periods = this.timePeriodUTCTimetoUserZoneTime(data[i].maintenance_periods);
        }
      }
      this.vehicle_trips = data;
      this.default_vehicle_trips = data;
    }
  
    getVehicleTripByQuery(IsloaderOpen, IsloaderClose){
      const obj = this.getGlobalSearhObject(); 
      const api=this.rootDirectory+'/operations/timeline/vehicle/?trip_type='+obj['vh_trip_type']+
      '&from_date='+obj['date_from']+
      '&to_date='+obj['date_to']+
      '&start_duration='+obj['duration_from']+
      '&end_duration='+obj['duration_to']+
      '&vehicle_type='+obj['vh_type']+
      '&trip_category='+obj['vh_trip_cat']+
      '&customer_name='+obj['vh_cus_name']+
      '&vehicle_name='+obj['vehicle_name']+
      '&garage_name='+obj['garage_loc']+
      '&group='+obj['vh_filter_grp'];
      

      if(IsloaderOpen){
        this.visibleOverlayDisplay();
      }
      this.http.get(api, this.getRequestConfiguration()).subscribe(res => {
         if(IsloaderClose){
          this.hideOverlayDisplay();
         }
         this.setVehicleTrips(res);
      },
      (err: HttpErrorResponse) => {
        if(IsloaderClose){
          this.hideOverlayDisplay();
         }
      });
    }

    getVehicleTrips(): object[]{
        return  this.vehicle_trips;
    }

    getVehicle(vehicleId:number){
      let obj = null;
      for(let i=0;i<this.vehicle_trips.length;i++){
        if(this.vehicle_trips[i].vehicle_id === vehicleId){
          obj = this.vehicle_trips[i];
          break;
        }
      }
      return obj;
    }

    getVehicleTrip(vehicleId:number, tripId:number):object{
      const obj = this.getVehicle(vehicleId);
      let trip = null;
      if(obj!==null){
        for(let j=0; j<obj.trips.length;j++){
          if(obj.trips[j].trip_id === tripId){
            trip = obj.trips[j];
            break;
          }
        }
      }
      return trip;
    }
  
    removeVehicleTrip(vehicleId:number, tripId:number):void{

      for(let i=0;i<this.vehicle_trips.length;i++){
        if(this.vehicle_trips[i].vehicle_id === vehicleId){
          for(let j=0; j<this.vehicle_trips[i].trips.length;j++){
            if(this.vehicle_trips[i].trips[j].trip_id === tripId){
              this.vehicle_trips[i].trips.splice(j,1); 
              break;
            }
          }
          break;
        }
      }
      this.vehicle_trips = this.vehicle_trips;
    }

    addVehicleTrip(vehicleId:number, trip: object):void{
      for(let i=0;i<this.vehicle_trips.length;i++){
        if(this.vehicle_trips[i].vehicle_id === vehicleId){
          this.vehicle_trips[i].trips.splice(this.vehicle_trips[i].trips.length, 0, trip);
          break;
        }
      }
      this.vehicle_trips = this.vehicle_trips;
    }
  

    /*---------------- Driver Trip Info ----------------- */
  
    driverTripGroupView(selection_type):void{

      this.dri_filter_grp = selection_type;

      if(selection_type === 'All'){
        this.driver_trips = this.default_driver_trips;
      }else{
        const withTrips=[];
        const withoutTrips=[];
        for(let i=0; i<this.default_driver_trips.length;i++){
          if(this.default_driver_trips[i].trips.length>0){
            withTrips.push(this.default_driver_trips[i]);
          }else{
            withoutTrips.push(this.default_driver_trips[i]);
          }
        }
        if(selection_type === 'Assigned'){
          this.driver_trips = withTrips;
        }else if(selection_type === 'Unassigned'){
          this.driver_trips = withoutTrips;
        }  
      }
    }

    setDriverTrips(data):void{
      for(let i=0; i<data.length;i++){

        if(data[i].image_path===''){
          data[i].image_path = this.getIcon()['Driver'];
        }

        if(data[i].trips.length>0){
          data[i].trips = this.tripUTCTimetoUserZoneTime(data[i].trips);
        }

        if(data[i].want_to_work_periods.length>0){
          data[i].want_to_work_periods = this.timePeriodUTCTimetoUserZoneTime(data[i].want_to_work_periods);
        }

        if(data[i].rest_periods.length>0){
          data[i].rest_periods = this.timePeriodUTCTimetoUserZoneTime(data[i].rest_periods);
        }

        if(data[i].hasOwnProperty('absence_periods') && data[i].absence_periods.length>0){
          data[i].absence_periods = this.timePeriodUTCTimetoUserZoneTime(data[i].absence_periods);
        }
      }
      this.driver_trips = data;
      this.default_driver_trips = data;
    }
  
    getDriverTripByQuery(IsloaderOpen, IsloaderClose) {
      
      const obj = this.getGlobalSearhObject();
  
      const api=this.rootDirectory+'/operations/timeline/driver/?trip_type='+obj['dri_trip_type']+
      '&from_date='+obj['date_from']+
      '&to_date='+obj['date_to']+
      '&start_duration='+obj['duration_from']+
      '&end_duration='+obj['duration_to']+
      '&driver_category='+obj['driver_type']+
      '&trip_category='+obj['dri_trip_cat']+
      '&customer_name='+obj['dri_cus_name']+
      '&driver_name='+obj['driver_name']+
      '&group='+obj['dri_filter_grp'];

      if(IsloaderOpen){
        this.visibleOverlayDisplay();
      }
      this.http.get(api, this.getRequestConfiguration()).subscribe(res => {
         if(IsloaderClose){
          this.hideOverlayDisplay();
         }
         this.setDriverTrips(res);
      },
      (err: HttpErrorResponse) => {
        if(IsloaderClose){
          this.hideOverlayDisplay();
         }
        console.log(err.error);
      });
    }

    getDriverTrips(): object[]{
        return  this.driver_trips;
    }

    getDriver(driverId:number){
      let obj = null;
      for(let i=0;i<this.driver_trips.length;i++){
        if(this.driver_trips[i].driver_id === driverId){
          obj = this.driver_trips[i];
          break;
        }
      }
      return obj;
    }

    getDriverTrip(driverId:number, tripId:number):object{
      const obj = this.getDriver(driverId);
      let trip = null;
      if(obj!==null){
        for(let j=0; j<obj.trips.length;j++){
          if(obj.trips[j].trip_id === tripId){
            trip = obj.trips[j];
            break;
          }
        }
      }
      return trip;
    }

  
    getDriverTripInstance(): object{
      return{
        driver_id: 0,
        name: '',
        contact: '',
        image_path:'',
        trips:[]
      };
    }

    removeDriverTrip(driverId:number, tripId:number):void{
      for(let i=0;i<this.driver_trips.length;i++){
        if(this.driver_trips[i].driver_id === driverId){
          for(let j=0; j<this.driver_trips[i].trips.length;j++){
            if(this.driver_trips[i].trips[j].trip_id === tripId){
              this.driver_trips[i].trips.splice(j,1); 
              break;
            }
          }
          break;
        }
      }
    }

    addDriverTrip(driverId:number, trip: object):void{
      for(let i=0;i<this.driver_trips.length;i++){
        if(this.driver_trips[i].driver_id === driverId){
          this.driver_trips[i].trips.push(trip);
          break;
        }
      }
    }

    /*---------------Save Trip-------------- */

    saveTrip(tripInfo:object, is_overlap_vhe:boolean, is_overlap_dri:boolean, has_pax:boolean):Observable<object>{
      this.visibleOverlayDisplay();
      const url = this.rootDirectory+'/operations/timeline/trip/'+tripInfo['name']+'/';
      const obj ={ 
        'driver':tripInfo['driver_id'], 
        'vehicle': tripInfo['vehicle_id'],
        'vehicle_overlap': is_overlap_vhe,
        'driver_overlap': true,
        'pax_limit': has_pax,
        'time_a': tripInfo['time_a'],
        'time_b1': tripInfo['time_b1'],
        'time_b2': tripInfo['time_b2'],
        'time_c1': tripInfo['time_c1'],
        'time_c2': tripInfo['time_c2'],
        'time_d': tripInfo['time_d'],
        'is_external': tripInfo['external']
      };

      return this.http.put(url, obj, this.getRequestConfiguration());
    }

    saveByDrop(dragType:string, dropType:string, refId:number, tripInfo:object, is_overlap: boolean, has_pax:boolean):Observable<object>{
      if(tripInfo===null){
        return;
      }
      //this.visibleOverlayDisplay();
      const url = this.rootDirectory+'/operations/timeline/trip/'+tripInfo['name']+'/';

      let obj = null;

      if(dropType==='vhe'){
        obj ={ 
          'vehicle': refId,
          'vehicle_overlap': is_overlap,
          'driver_overlap': true,
          'pax_limit':has_pax,
        };
      }else if(dropType==='dri'){
        obj ={ 
          'driver': refId,
          'vehicle_overlap': is_overlap,
          'driver_overlap': true,
          'pax_limit':has_pax,
        };
      }else{
        obj ={ 
          'driver': (this.getViewMode())? 0 : tripInfo['driver_id'], 
          'vehicle': (!this.getViewMode())? 0 : tripInfo['vehicle_id'],
          'vehicle_overlap': true,
          'driver_overlap': true,
          'pax_limit':has_pax,
        };
      }

      return this.http.put(url, obj, this.getRequestConfiguration());
    }


    /*---------------Save Airport Trip-------------- */

    airportEvent(obj):Observable<object>{
      this.visibleOverlayDisplay();
      const url = this.rootDirectory+'/operations/timeline/airport/';
      return this.http.put(url, obj, this.getRequestConfiguration());
    }
    
    /*---------------Get Configuration-------------- */
    getConfiguration():Observable<object>{
      const url = this.rootDirectory+'/operations/timeline/config'+'/';
      return this.http.get(url, this.getRequestConfiguration());
    }

    getAirportList():Observable<object>{
      const url = this.rootDirectory+'/settings/airport/';
      return this.http.get(url, this.getRequestConfiguration());
    }

    getFirebaseConfig():Observable<object>{
      const furl = this.rootDirectory.replace('/api','');
      const url = furl +'/firebase/';
      return this.http.get(url);
    }


    /*-----------------------Synchronizing With Planning Module -----------------*/


    sync_trip_type(trip_type){
      if(localStorage.getItem('trip_type') !== null){
        return localStorage.getItem('trip_type').split(',').includes(trip_type.toUpperCase());
      }else{
        return true;
      }
    }

    sync_trip_cat(trip_cat){
      if(localStorage.getItem('trip_owner_type') !== null){
        return localStorage.getItem('trip_owner_type').split(',').includes(trip_cat.toUpperCase());
      }else{
        return true;
      }
    }

    get_sync_time(){
      const date_str = localStorage.getItem('start_time').split('/');
      const dt = new Date(parseInt(date_str[2],10),parseInt(date_str[1],10)-1,parseInt(date_str[0],10));
      return dt;
    }

    //Global Image Path

    getIcon():object{
      const imgpath = 'https://s3-eu-west-1.amazonaws.com/teq.busgroup.no/assets/images';
      return{
        Aeroplane: imgpath+'/aeroplane.png',
        ArrowDownActive: imgpath+'/arrow-down-active.png',
        ArrowDownDeactive: imgpath+'/arrow-down-deactive.png',
        ArrowUpActive: imgpath+'/arrow-up-active.png',
        ArrowUpDeactive: imgpath+'/arrow-up-deactive.png',

        Bus: imgpath+'/bus.png',
        Calendar: imgpath+'/calendar.png',
        Clock: imgpath+'/clock.png',
        CarKey: imgpath+'/car-key.png',

        Driver: imgpath+'/driver.png',
        DeliveryMan: imgpath+'/delivery-man.png',
        DownArrow: imgpath+'/down-arrow.png',
        Filter: imgpath+'/filter.png',
        FlightRed: imgpath+'/flight-red.png',
        FlightGreen: imgpath+'/flight-green.png',
        Error: imgpath+'/error.png',
        ExtDriver: imgpath+'/ext-driver.png',
        ExternalCompany: imgpath+'/ext-company.png',
        
        Help:imgpath+'/help.png',
        Info: imgpath+'/info.png',
        LinkArrow: imgpath+'/link-arrow.png',
        LeftArrow: imgpath+'/left-arrow.png',
        Loading: imgpath+'/loading.gif',
        RightArrow: imgpath+'/right-arrow.png',
        
        Search: imgpath+'/search.png',
        Settings: imgpath+'/settings.png',

        //Settings: 'assets/settings.png',

        Shift: imgpath+'/shift.png',
        Sort: imgpath+'/sort.png',
        Success:imgpath+'/success.png',
        Toggle: imgpath+'/toggle.png',
        Luggage: imgpath+'/trip-luggage.png',
        User: imgpath+'/user-queqe.png',
        UserWhite: imgpath+'/user-queqe-white.png',
        Warning: imgpath+'/warning.png',
        Vehicle: imgpath+'/vehicle.png'
      };
    }

    getColorCode():object{
      return{
        grey:'#727272',
        lightblue:'#72978D',
        
        red: status_code['red'], //Absence
        green: status_code['green'], //Work
        orange: status_code['orange'], //Rest
        magenta: status_code['magenta'] //Maintenance
      };
    }

    set_preference_color(trip){
      if(trip['color'] === '#8cb3e3' ) { //planning -
        trip['color'] = '#669dd2'; 
      }else if(trip['color'] === '#c880f4' ) { //pending -
        trip['color'] = '#C37EED'; 
      }else if(trip['color'] === '#99ff99' ) { //waiting
        trip['color'] = '#74e4b7'; 
      }else if(trip['color'] === '#00c400' ) { //Running -
        trip['color'] = '#7ed321'; 
      }else if(trip['color'] === '#ffff00' ) { //warning -
        trip['color'] = '#ffaf2b'; 
      }else if(trip['color'] === '#ff0000' ) { //Alarm
        trip['color'] = '#fe6d7f'; 
      }
      return trip;
    }




    //get selected period

    set_current_selected_period(header_title, obj){
      this.selected_period = obj;
      this.selected_period['header_title'] = header_title;
    }

    get_selected_period(){
      return this.selected_period;
      // return {
      //   start : '2018-04-08T22:00:00',
      //   end : '2018-04-09T22:00:00',
      //   category : 'Vacation',
      //   type : 'absence',
      //   comments : ''
      // };
    }

  
    /*-------------------Panel Movement----------------- */


    constructor(public http: HttpClient) { 
      // console.log(this.rootDirectory);
      // console.log(window.location.href,  window.location.host, window.location.hostname);
    }

}
