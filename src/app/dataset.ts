import { Legend } from './model/legend';
import { VehicleType } from './model/VehicleType';

const obj={
    red: '#e61c55', //Absence
    green: '#00c400', //Work
    orange:'#f6821b', //Rest
    magenta:'#e61c1c' //Maintenance
};

export const status_code: object = obj;
   
export const Legends: Legend[] = [
    {  Color: '#669dd2', Name:'Planning', HasIcon: false}, //4EAFF2
    {  Color: '#C37EED', Name:'Pending', HasIcon: false},
    {  Color: '#74e4b7', Name:'Waiting', HasIcon: false}, //88DFBA
    {  Color: '#a7a7a7', Name:'Closed', HasIcon: false}, //CCD6D2
    {  Color: '#727272', Name:'Un-Planned', HasIcon: false},//8C9993

    {  Color: '#7ed321', Name:'Running', HasIcon: false}, //33E621
    {  Color: '#ffaf2b', Name:'Warning', HasIcon: false}, //E6DD21
    {  Color: '#fe6d7f', Name:'Alarm', HasIcon: false}, //F95015

    {  Color: 'glyphicon glyphicon-registration-mark', Name:'Bus rent', HasIcon: true},
    {  Color: 'glyphicon glyphicon-briefcase', Name:'External dri.', HasIcon: true},
    {  Color: 'glyphicon glyphicon-plane', Name:'Airport trip', HasIcon: true},
];

export const Status_Color: Legend[]=[
    {Color: obj['green'] , Name: 'Work', HasIcon:false},
    {Color: obj['orange'] , Name: 'Rest', HasIcon:false},
    {Color: obj['red'] , Name: 'Absence', HasIcon:false},
    {Color: obj['magenta'] , Name: 'Maintenance', HasIcon:false}
];


