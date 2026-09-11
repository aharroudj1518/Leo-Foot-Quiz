import type {Profile,Session} from './quiz';

export function isUtcDate(value:unknown):value is string {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T00:00:00Z');
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function dailyDate(session:Session|null|undefined):string|null {
 if(!session?.daily||!session.completed||!session.seed.startsWith('daily-'))return null;
 const day=session.seed.slice(6);return isUtcDate(day)?day:null;
}
function dailySessions(profile:Profile){return [...profile.history,...(profile.latestDaily?[profile.latestDaily]:[]),...(profile.session?[profile.session]:[])].filter(s=>dailyDate(s)!==null);}
export function completedDailyDates(profile:Profile):string[]{
 return [...new Set([...(profile.dailyCompleted??[]),...dailySessions(profile).map(s=>dailyDate(s)!)])].filter(isUtcDate).sort();
}
export function retainDailyProgress(profile:Profile):Profile {
 const latestDaily=dailySessions(profile).sort((a,b)=>dailyDate(b)!.localeCompare(dailyDate(a)!))[0]??null;
 return {...profile,dailyCompleted:completedDailyDates(profile),latestDaily};
}
export function dailyResult(profile:Profile,day:string):Session|undefined {
 return dailySessions(profile).find(s=>dailyDate(s)===day);
}
function shiftDay(day:string,offset:number){return new Date(Date.parse(day+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);}
export function dailyCalendar(profile:Profile,today:string){
 if(!isUtcDate(today))throw new Error('Expected a UTC calendar date');
 const completed=new Set(completedDailyDates(profile).filter(day=>day<=today));
 let cursor=completed.has(today)?today:shiftDay(today,-1),streak=0;
 while(completed.has(cursor)){streak++;cursor=shiftDay(cursor,-1);}
 const days=Array.from({length:7},(_,i)=>{const day=shiftDay(today,i-6);return {day,completed:completed.has(day),today:day===today};});
 return {streak,days};
}
