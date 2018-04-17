import { Directive, ElementRef } from '@angular/core';
import { Element } from '@angular/compiler';
import { debug } from 'util';

@Directive({
  selector: '[appTrip]'
})
export class TripDirective {
  data={};
  elem=null;
  constructor(el: ElementRef) {
    this.elem = el.nativeElement;
    //console.log(obj.getAttribute('loc-from'));
    //data-LocFrom={{item.LocFrom}} data-LocTo={{item.LocTo}} 
    //data-DepartureTime={{item.DepartureTime}} data-ArrivalTime={{item.ArrivalTime}}
 
    /*this.data = {
      arrivaltime: new Date(obj.arrivaltime),
      departuretime: new Date(obj.departuretime),
      locFrom: obj.locFrom,
      locTo: obj.locTo,
      tripId: parseInt(obj.DOMStringMap.tripId,10)
    };*/

    //this.elem.nativeElement.fill = this.elem.nativeElement.id;
    this.newEl(this.elem);
   }
   private newEl(elem) {
   }

}
