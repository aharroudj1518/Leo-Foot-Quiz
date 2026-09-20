import {Text} from './Typography';
import React from 'react';
import {Image,StyleSheet,View} from 'react-native';
import {clubKit,type ClubKit} from './clubKits';
import {clubCrests} from './clubCrests';
import {Reveal} from './VisualExperience';

type Props={country:string;number:number;club:string;competition?:string;identity?:string;largeText?:boolean};

function Pattern({kit}:{kit:ClubKit}){
 if(kit.pattern==='stripes')return <View style={[StyleSheet.absoluteFill,{flexDirection:'row'}]}>{Array.from({length:7},(_,i)=><View key={i} style={{flex:1,backgroundColor:i%2?kit.secondary:kit.base}}/>)}</View>;
 if(kit.pattern==='hoops')return <View style={StyleSheet.absoluteFill}>{Array.from({length:8},(_,i)=><View key={i} style={{flex:1,backgroundColor:i%2?kit.secondary:kit.base}}/>)}</View>;
 if(kit.pattern==='halves')return <View style={{position:'absolute',right:0,top:0,bottom:0,width:'50%',backgroundColor:kit.secondary}}/>;
 if(kit.pattern==='sash')return <View style={{position:'absolute',width:24,height:180,top:-22,backgroundColor:kit.secondary,transform:[{rotate:'35deg'}]}}/>;
 if(kit.pattern==='panel')return <View style={{position:'absolute',top:0,bottom:0,width:24,backgroundColor:kit.secondary,borderLeftWidth:3,borderRightWidth:3,borderColor:'#FFFFFF'}}/>;
 if(kit.pattern==='cross')return <><View style={{position:'absolute',top:0,bottom:0,width:16,backgroundColor:kit.secondary}}/><View style={{position:'absolute',left:0,right:0,top:38,height:18,backgroundColor:kit.secondary}}/></>;
 if(kit.pattern==='band')return <View style={{position:'absolute',left:0,right:0,top:38,height:22,backgroundColor:kit.secondary}}/>;
 return null;
}
/** Club-colour illustration: traditional identity, not a season-specific replica. */
export function SquadClue({country,number,club,competition='CLUB SQUAD · 2026/27',identity,largeText=false}:Props){
 const kit=clubKit(country),crest=clubCrests[country];
 const base=kit?.base??'#DCE5E3',secondary=kit?.secondary??'#476A68';
 return <Reveal identity={identity??`${country}-${number}`}><View testID="squad-clue" style={k.card}>
  <Text style={k.season}>{competition}</Text>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12}}><Text style={[k.team,{flex:1},largeText&&{fontSize:22,lineHeight:28}]}>{country}</Text>{crest&&<View style={{backgroundColor:'#FFFFFF',padding:5,borderRadius:8}}><Image source={crest} resizeMode="contain" style={{width:38,height:38}} accessibilityLabel={`${country} crest`}/></View>}</View>
  <View style={k.content}>
   <View accessible accessibilityRole="image" accessibilityLabel={`${country} club-colour shirt: ${kit?.description??'colours unavailable'}, number ${number}`} style={k.shirt}>
    <View style={k.shadow}/>
    <View style={[k.sleeve,k.leftSleeve,{backgroundColor:kit?.pattern==='sleeves'?secondary:base}]}><View style={[k.cuff,{backgroundColor:secondary}]}/></View>
    <View style={[k.sleeve,k.rightSleeve,{backgroundColor:kit?.pattern==='sleeves'||kit?.pattern==='halves'?secondary:base}]}><View style={[k.cuff,{backgroundColor:secondary}]}/></View>
    <View style={[k.body,{backgroundColor:base}]}>
     {kit&&<Pattern kit={kit}/>}
     <View style={k.leftSeam}/><View style={k.rightSeam}/>
     <View style={k.yoke}/>
     <Text accessible={false} allowFontScaling={false} style={[k.number,{color:kit?.ink??'#103C3B',textShadowColor:kit?.ink==='#FFFFFF'?'#111111':'#FFFFFF',textShadowRadius:3,textShadowOffset:{width:1,height:1}}]}>{number}</Text>
     <View style={k.hem}/>
    </View>
    <View style={[k.collar,{borderColor:secondary}]}/>
   </View>
   <View style={k.details}>
    <Text style={k.label}>Position</Text>
    <Text style={[k.position,largeText&&{fontSize:21,lineHeight:28}]}>{club}</Text>
    <View style={k.rule}/>
    <Text style={k.note}>Name the player behind the number.</Text><Text style={k.note}>Club colours · {kit?.description??'unavailable'}</Text>
   </View>
  </View>
 </View></Reveal>;
}

const k=StyleSheet.create({
 card:{backgroundColor:'#10445B',borderWidth:2,borderColor:'#8DCDD4',borderRadius:18,padding:16,marginBottom:14,overflow:'hidden'},
 season:{color:'#BCD0C8',fontSize:9,fontWeight:'700',letterSpacing:1.1,lineHeight:14},
 team:{color:'#FFF8E7',fontSize:18,fontWeight:'800',lineHeight:24,marginTop:5},
 content:{flexDirection:'row',alignItems:'center',gap:14,marginTop:8},
 shirt:{width:148,height:151,flexShrink:0},
 shadow:{position:'absolute',bottom:0,left:18,width:112,height:10,borderRadius:60,backgroundColor:'#102E2E'},
 sleeve:{position:'absolute',top:19,width:49,height:46,overflow:'hidden',borderRadius:3},
 leftSleeve:{left:5,transform:[{rotate:'34deg'}]},
 rightSleeve:{right:5,transform:[{rotate:'-34deg'}]},
 cuff:{position:'absolute',bottom:4,left:0,right:0,height:5,backgroundColor:'#B3995F'},
 body:{position:'absolute',left:30,top:14,width:88,height:128,borderTopLeftRadius:15,borderTopRightRadius:15,borderBottomLeftRadius:6,borderBottomRightRadius:6,alignItems:'center',overflow:'hidden'},
 collar:{position:'absolute',left:56,top:10,width:36,height:19,borderBottomLeftRadius:20,borderBottomRightRadius:20,backgroundColor:'#10445B',borderBottomWidth:4,borderLeftWidth:3,borderRightWidth:3,borderColor:'#B3995F'},
 yoke:{width:60,height:1,marginTop:31,backgroundColor:'#D4CAB2'},
 leftSeam:{position:'absolute',left:8,top:26,bottom:8,width:1,backgroundColor:'#D2C8B0'},
 rightSeam:{position:'absolute',right:8,top:26,bottom:8,width:1,backgroundColor:'#F8F0DC'},
 number:{fontSize:53,lineHeight:69,fontWeight:'900',letterSpacing:-3,color:'#173C3B',fontVariant:['tabular-nums'],paddingRight:3},
 hem:{position:'absolute',bottom:6,left:7,right:7,height:2,backgroundColor:'#B8B09E'},
 details:{flex:1,minWidth:0,gap:5},label:{fontSize:11,color:'#BCD0C8',fontWeight:'600'},
 position:{fontSize:17,lineHeight:23,fontWeight:'800',color:'#FFF8E7'},
 rule:{height:2,width:24,backgroundColor:'#CFB576',marginVertical:6},
 note:{fontSize:11,lineHeight:16,color:'#BCD0C8'}
});
