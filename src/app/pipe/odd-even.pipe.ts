import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'oddEven'
})
export class OddEvenPipe implements PipeTransform {

  transform(objs:object[], filterargs: string[]): any {
   
    debugger;
    if(filterargs===null || filterargs.length<=2){
      const property = filterargs[0];
      const IsOdd = filterargs[1];

      console.log(property, IsOdd);

      if(property===null || property==='' || IsOdd==null || objs === null 
      || objs.length===0 || !objs[0].hasOwnProperty(property)){
        return objs;
      }else{
        // if(IsOdd){
        //   return objs.filter(x=> x[property]%2 !== 0);
        // }else{
        //   return objs.filter(x=> x[property]%2 === 0);
        // }
      }
    }else{
      return objs;
    }
  }

  

}
