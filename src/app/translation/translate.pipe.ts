import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../translation/translation.service';
@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(private translation: TranslationService){}

  transform(value: any, args?: any): any {
    if(!value){
      return;
    }else{
      return this.translation.instant(value);
    }
  }

}
