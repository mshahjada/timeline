import { Directive, ElementRef } from '@angular/core';
import { Element } from '@angular/compiler';
import { DataService } from '../service/data.service';

@Directive({
  selector: '[appTimer]'
})
export class TimerDirective {

  marginLeft = 0;

  traverse(el){
    const secondsInDay = this.dataService.getFormatTimeInSec();
    const timeElaspedInSec = this.dataService.getTimeElaspedInSec();
    
    if(timeElaspedInSec>secondsInDay || timeElaspedInSec===-1){
      el.nativeElement.style.display='none';
    }else{
      const actualWidth = 88;
      this.marginLeft = ((actualWidth*timeElaspedInSec)/secondsInDay);
      el.nativeElement.style.marginLeft = this.marginLeft+'%';
      el.nativeElement.style.display='';
    }
    return el;
  }
  constructor(public dataService:DataService, el:ElementRef) { 
    //el = this.traverse(el);
    setInterval(function(){
      const secondsInDay = dataService.getFormatTimeInSec();
      const timeElaspedInSec = dataService.getTimeElaspedInSec();
      const elem_timer = document.getElementById('timer-pointer-line');

      let has_zoom_feature = false;
      if(elem_timer.hasAttribute('zoom-enable')){
        has_zoom_feature = JSON.parse(elem_timer.getAttribute('zoom-enable'));
      }
      
      if(timeElaspedInSec>secondsInDay || timeElaspedInSec===-1 || has_zoom_feature){
        el.nativeElement.style.display='none';
      }else{
        const actualWidth = 88;
        this.marginLeft = ((actualWidth*timeElaspedInSec)/secondsInDay);
        el.nativeElement.style.marginLeft = this.marginLeft+'%';
        el.nativeElement.style.display='';
      }
      
    },1000);
  }


}
