import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {Profile} from './core/quiz';
import {dailyCalendar} from './core/daily';
import {C,Icon} from './ui';

export function DailyChallenge({profile,today,completed,onPlay}:{profile:Profile;today:string;completed:boolean;onPlay:()=>void}){
 const calendar=dailyCalendar(profile,today);
 return <View style={styles.card} testID="daily-challenge">
  <Pressable accessibilityRole="button" accessibilityLabel={completed?'See today’s result':'Play today’s five'} onPress={onPlay} style={({pressed})=>[styles.action,{opacity:pressed?.8:1}]}>
   <Icon name={completed?'checkmark-circle':'sunny-outline'} size={27}/><View style={{flex:1,gap:3}}><Text style={styles.title}>{completed?'Today’s five: completed':'Today’s five'}</Text><Text style={styles.subtitle}>{completed?'Your score is ready to revisit':'Five questions. A fresh game every day.'}</Text></View><Icon name="arrow-forward" size={22}/>
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
const styles=StyleSheet.create({card:{borderRadius:14,backgroundColor:'#F4CF55',overflow:'hidden'},action:{padding:16,flexDirection:'row',alignItems:'center',gap:12},title:{fontSize:16,fontWeight:'800',color:C.ink},subtitle:{fontSize:12,lineHeight:17,color:C.ink},activity:{paddingHorizontal:16,paddingBottom:15,gap:12},caption:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:6,borderTopWidth:1,borderColor:'#DBC05C',paddingTop:12},streak:{fontSize:12,fontWeight:'800',color:C.ink},reset:{fontSize:10,lineHeight:16,color:C.ink},days:{flexDirection:'row',justifyContent:'space-between',gap:3},day:{flex:1,alignItems:'center',gap:7},dayLabel:{fontSize:10,color:C.ink},mark:{width:28,height:28,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#F9E6A0'},done:{backgroundColor:C.ink},today:{borderWidth:2,borderColor:C.ink},date:{fontSize:11,fontWeight:'600',color:C.ink}});
