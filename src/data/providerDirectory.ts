export type DirectoryStatus='available'|'connected'|'coming-soon'|'unavailable';
export interface DirectoryProvider{id:string;name:string;domain:string;category:string;description:string;status:DirectoryStatus;mark:string;demo?:boolean}
export const providerDirectory:DirectoryProvider[]=[
  {id:'irembo',name:'Irembo',domain:'Serivisi rusange',category:'Serivisi rusange',description:'Serivisi za Leta, zishingiye ku cyo ushaka gukora.',status:'connected',mark:'i'},
  {id:'rra',name:'RRA',domain:'Ubucuruzi n’imisoro',category:'Ubucuruzi',description:'Reba amakuru y’imisoro n’ibikorwa by’ubucuruzi.',status:'available',mark:'R',demo:true},
  {id:'rwanda-education',name:'Rwanda Education',domain:'Uburezi',category:'Uburezi',description:'Serivisi zijyanye n’amashuri n’imyigire.',status:'coming-soon',mark:'E',demo:true},
  {id:'health',name:'Ubuzima Rwanda',domain:'Ubuzima',category:'Ubuzima',description:'Amakuru ya serivisi z’ubuzima.',status:'coming-soon',mark:'U',demo:true},
  {id:'eucl',name:'EUCL',domain:'Ubwikorezi n’ingufu',category:'Ubwikorezi',description:'Kugura umuriro no kureba konti ya metero.',status:'unavailable',mark:'E',demo:true},
  {id:'finance',name:'Imari Rwanda',domain:'Imari',category:'Imari',description:'Serivisi z’imari zifasha gucunga ubwishyu.',status:'coming-soon',mark:'I',demo:true},
];
