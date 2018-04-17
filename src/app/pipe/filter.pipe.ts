import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(objs:object[], filterargs: string[]): any {
    if(filterargs===null || filterargs.length<=2){
      const property= filterargs[0];
      const searchVal= filterargs[1];
      if(property===null || property==='' || searchVal==null || searchVal==='' || objs === null 
      || objs.length===0 || !objs[0].hasOwnProperty(property)){
        return objs;
      }else{
        return objs.filter(x=> x[property].toUpperCase().indexOf(searchVal.toUpperCase())!==-1);
      }
    }else{
      return objs;
    }
  }
}
