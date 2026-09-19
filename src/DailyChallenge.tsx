import {Text} from './Typography';
import React from 'react';
import {Pressable,StyleSheet,View} from 'react-native';
import type {Profile} from './core/quiz';
import {dailyCalendar} from './core/daily';
import {C,Icon} from './ui';

export function DailyChallenge({profile,today,completed,onPlay}:{profile:Profile;today:string;completed:boolean;onPlay:()=>void}){
 const calendar=dailyCalendar(profile,today);
 return <View style={styles.card} testID="daily-challenge">
  <Pressable accessibilityRole="button" accessibilityLabel={completed?'See today’s result':'Play today’s five'} onPress={onPlay} style={({pressed})=>[styles.action,{opacity:pressed?.8:1}]}>
   <Icon name={completed?'checkmark-circle':'sunny-outline'} size={27} color={C.navy}/><View style={{flex:1,gap:3}}><Text style={styles.title}>{completed?'Today’s five: completed':'Today’s five'}</Text><Text style={styles.subtitle}>{completed?'Your score is ready to revisit':'Five questions. A fresh game every day.'}</Text></View><Icon name="arrow-forward" size={22} color={C.navy}/>
  </Pressable>
  <View style={styles.activity}>
   <View style={styles.caption}><Text style={styles.streak}>{calendar.streak?`${calendar.streak}-day streak`:'Make today day one'}</Text><Text style={styles.reset}>Resets 00:00 UTC</Text></View>
   <View style={styles.days}>{calendar.days.map(({day,completed:done,today:isToday})=><View key={day} accessible accessibilityLabel={`${day}${isToday?', today':''}: ${done?'completed':'not completed'}`} style={styles.day}>
    <Text style={[styles.dayLabel,isToday&&{fontWeight:'800'}]}>{isToday?'Today':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(day+'T00:00:00Z').getUTCDay()]}</Text>
    <View style={[styles.mark,done&&styles.done,isToday&&!done&&styles.today]}>{done?<Icon name="checkmark" color="white" size={16}/>:<Text style={styles.date}>{Number(day.slice(-2))}</Text>}</View>
   </View>)}</View>
  </View>
 </View>;
}
const styles=StyleSheet.create({
  card:{borderRadius:18,borderWidth:2,borderBottomWidth:5,borderColor:'#FFF1AA',borderBottomColor:'#B68C28',backgroundColor:C.lime,overflow:'hidden'},
  action:{padding:16,flexDirection:'row',alignItems:'center',gap:12},
  title:{fontSize:18,fontWeight:'900',color:C.navy},
  subtitle:{fontSize:12,lineHeight:18,color:C.navy},
  activity:{paddingHorizontal:16,paddingBottom:15,gap:12},
  caption:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:6,borderTopWidth:1,borderColor:'#DBC05C',paddingTop:12},
  streak:{fontSize:12,fontWeight:'800',color:C.navy},
  reset:{fontSize:10,lineHeight:16,color:C.navy},
  days:{flexDirection:'row',justifyContent:'space-between',gap:3},
  day:{flex:1,alignItems:'center',gap:7},
  dayLabel:{fontSize:10,color:C.navy},
  mark:{width:30,height:30,borderRadius:9,alignItems:'center',justifyContent:'center',backgroundColor:'#FFF1B0'},
  done:{backgroundColor:C.navy},
  today:{borderWidth:2,borderColor:C.navy},
  date:{fontSize:11,fontWeight:'600',color:C.navy}
});
