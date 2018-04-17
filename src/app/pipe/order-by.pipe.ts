import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  IsASC=true;
  transform(objs: object[], property: string): any {
   
    if(property===null || property==='' || objs === null || objs.length===0){
      return objs;
    }else{
      if(property.substring(0,1)==='-'){
        this.IsASC = false;
        property = property.slice(1,property.length);
      }else{
        this.IsASC = true;
      }

      if(!objs[0].hasOwnProperty(property)){
        return objs;
      }else{
        objs.sort((a: any, b: any) => {
          if (a[property] < b[property]) {
            return (this.IsASC)? -1 : 1;
          } else if (a[property] > b[property]) {
            return (this.IsASC)? 1 : -1;
          } else {
            return 0;
          }
        });
        return objs;
      }
    }
  }
}
