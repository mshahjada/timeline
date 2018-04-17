import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTripdrag]'
})
export class TripdragDirective {

  moveActive=false;
  dragEvent=null;

  constructor(private el: ElementRef) { }

  @HostListener('dragstart', ['$event']) onDragStart(ev){
    if(ev['shiftKey']){ return; }
    const elem = document.getElementById(this.el.nativeElement.id);
    if(elem.getAttribute('status') === 'closed'){ //trip status
      return;
    }
    this.dragEvent=ev;
    ev.dataTransfer.setData('elementId', this.el.nativeElement.id);
  }

  @HostListener('mousedown', ['$event']) onMouseDown(ev){
    this.moveActive=true;
  }
  @HostListener('mouseup', ['$event']) onMouseUo(ev){
    this.moveActive=false;
    this.dragEvent=null;
  }
  @HostListener('mousemove', ['$event']) onMouseMove(ev){
   /* if(this.dragEvent!=null && this.moveActive && this.dragEvent.clientX<ev.clientX){
      console.log(ev.clientX);
    }else{

    }
    */
  }
}
