import { Component, Input, Injectable } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { notification } from '../message/notify';

// import {  } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})

export class MessageComponent {  

  public ngbModalRef: NgbModalRef;
  modalObj = null;
  propertyImg = null;
  
  open(message, viewType): NgbModalRef{
    this.ngbModalRef = this.modalService.open(MessageComponent);
    const imgpath = 'https://s3-eu-west-1.amazonaws.com/teq.busgroup.no/assets/images';
    this.propertyImg={
      Error : imgpath+'/error.png',
      Success : imgpath+'/success.png',
      Warning : imgpath+'/warning.png'
    };

    let OkText = '';
    let CancelText = '';

    if(viewType === 'decision'){
      OkText = 'Yes';
      CancelText = 'Cancel';
    }else if(viewType === 'error'){
      OkText = 'Ok';
      CancelText = 'Close';
    }else if(viewType === 'loader'){
      OkText = 'Ok';
      CancelText = 'Close';
    }else if(viewType === 'success'){
      OkText = 'Ok';
      CancelText = 'Close';
    }else if(viewType === 'warning'){
      OkText = 'Ok';
      CancelText = 'Close';
    }

    


    this.modalObj={
      PlainText : Array.isArray(message)? '' : message,
      ViewType: viewType,
      MessageList: Array.isArray(message)? message : [],
      Decision: notification.continue,
      CloseText: CancelText,
      OkText: OkText
    };

    this.ngbModalRef.componentInstance.propertyImg = this.propertyImg;
    this.ngbModalRef.componentInstance.modalObj = this.modalObj;
    return this.ngbModalRef;
  }

  close():void {
    this.ngbModalRef.close();
  }
  
  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal) {
   }

}













