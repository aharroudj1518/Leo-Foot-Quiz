import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Reveal} from './VisualExperience';

type Props={country:string;number:number;club:string;competition?:string;identity?:string;largeText?:boolean};

/** Original unbranded puzzle shirt; deliberately independent of official kits. */
export function SquadClue({country,number,club,competition='CLUB SQUAD · 2026/27',identity,largeText=false}:Props){
 return <Reveal identity={identity??`${country}-${number}`}><View testID="squad-clue" style={k.card}>
  <Text style={k.season}>{competition}</Text>
  <Text style={[k.team,largeText&&{fontSize:22,lineHeight:28}]}>{country}</Text>
  <View style={k.content}>
   <View accessible accessibilityRole="image" accessibilityLabel={`Football shirt number ${number}`} style={k.shirt}>
    <View style={k.shadow}/>
    <LinearGradient colors={['#FFF8E7','#CFC7B1']} style={[k.sleeve,k.leftSleeve]}><View style={k.cuff}/></LinearGradient>
    <LinearGradient colors={['#FFF8E7','#DAD0B7']} style={[k.sleeve,k.rightSleeve]}><View style={k.cuff}/></LinearGradient>
    <LinearGradient colors={['#FFF8E7','#E9DFC5','#CAC1AA']} locations={[0,.7,1]} style={k.body}>
     <View style={k.leftSeam}/><View style={k.rightSeam}/>
     <View style={k.yoke}/>
     <Text accessible={false} allowFontScaling={false} style={k.number}>{number}</Text>
     <View style={k.hem}/>
    </LinearGradient>
    <View style={k.collar}/>
   </View>
   <View style={k.details}>
    <Text style={k.label}>Position</Text>
    <Text style={[k.position,largeText&&{fontSize:21,lineHeight:28}]}>{club}</Text>
    <View style={k.rule}/>
    <Text style={k.note}>Name the player behind the number.</Text>
   </View>
  </View>
 </View></Reveal>;
}

const k=StyleSheet.create({
 card:{backgroundColor:'#173C3B',borderRadius:18,padding:16,marginBottom:14,overflow:'hidden'},
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
 collar:{position:'absolute',left:56,top:10,width:36,height:19,borderBottomLeftRadius:20,borderBottomRightRadius:20,backgroundColor:'#173C3B',borderBottomWidth:4,borderLeftWidth:3,borderRightWidth:3,borderColor:'#B3995F'},
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
