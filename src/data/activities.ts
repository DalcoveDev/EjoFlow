export type ActivityStatus = 'completed' | 'pending' | 'failed';
export interface Activity { id:string; provider:string; service:string; action:string; date:string; time:string; status:ActivityStatus; reference:string; amount?:string; }
export const activities:Activity[]=[
  {id:'ef-184',provider:'Irembo',service:'Mutuelle',action:'Ubwishyu',date:'Uyu munsi',time:'10:42',status:'completed',reference:'EF-2026-000184',amount:'12,000 RWF'},
  {id:'ef-179',provider:'Irembo',service:'Gusaba serivisi',action:'Kohereza ubusabe',date:'Uyu munsi',time:'08:16',status:'pending',reference:'EF-2026-000179'},
  {id:'ef-163',provider:'Irembo',service:"Serivisi z'inyandiko",action:'Kureba status',date:'14 Kanama 2026',time:'15:08',status:'completed',reference:'EF-2026-000163'},
  {id:'ef-155',provider:'RRA',service:'Imisoro',action:'Kureba amakuru',date:'12 Kanama 2026',time:'09:25',status:'failed',reference:'EF-2026-000155'},
];
