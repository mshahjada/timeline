import { Injectable } from '@angular/core';
import { LANG_DIC_NB } from './lang-nb';

@Injectable()
export class TranslationService {

  lang_name='nb';
  lang_dictionary = LANG_DIC_NB;
  constructor() { }

  set_translate_language(val){
    this.lang_name = val;
    if(this.lang_name==='nb'){//Norwegian
      this.lang_dictionary = LANG_DIC_NB; 
    }
  }

  instant(data){
    const val = this.lang_dictionary[data];
    return ((val)? val : data);
  }

}
