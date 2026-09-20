import {Text} from './Typography';
import {clubCrests} from './clubCrests';
import cormorantLicense from './content/cormorant-license.json';
import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo,Animated,Image,ImageSourcePropType,Pressable,StyleSheet,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {C, Icon} from './ui';
import {DailyChallenge} from './DailyChallenge';
import type {Mode, Profile, Question} from './core/quiz';
import baseCredits from '../assets/visual/credits.json';
import playerCredits from '../assets/players/manifest.json';
import questions from './content/visual-questions.json';
import connectionQuestions from './content/connection-questions.json';
import {playerImages} from './playerImages';
import stadiumCredits from '../assets/stadiums/manifest.json';
import {stadiumImages} from './stadiumImages';
const credits=[...baseCredits,...playerCredits,...stadiumCredits.filter(p=>p.visualReview)];
const stadiumCount=questions.filter(q=>q.category==='stadiums').length;
const portraitCount=questions.filter(q=>q.category==='portraits').length;

export const visualImages: Record<string, ImageSourcePropType> = {
  ...playerImages,...stadiumImages,
  messi:require('../assets/visual/messi.jpg'), ronaldo:require('../assets/visual/ronaldo.jpg'),
  mbappe:require('../assets/visual/mbappe.jpg'), salah:require('../assets/visual/salah.jpg'),
  haaland:require('../assets/visual/haaland.jpg'), wembley:require('../assets/visual/wembley.png'),
  allianz:require('../assets/visual/allianz.jpg'), maracana:require('../assets/visual/maracana.jpg'),
};
export function useReducedMotion(){
  const [reduced,setReduced]=useState(true);
  useEffect(()=>{let active=true;AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(active)setReduced(v);});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>{active=false;sub.remove();};},[]);
  return reduced;
}
export function Reveal({children,identity}:{children:React.ReactNode;identity:string}){
  const motion=useRef(new Animated.Value(1)).current,reduced=useReducedMotion();
  useEffect(()=>{if(reduced){motion.setValue(1);return;}motion.setValue(0);const animation=Animated.spring(motion,{toValue:1,damping:18,stiffness:130,mass:1,useNativeDriver:true});animation.start();return()=>animation.stop();},[identity,reduced,motion]);
  return <Animated.View style={{opacity:motion,transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[18,0]})},{scale:motion.interpolate({inputRange:[0,1],outputRange:[.97,1]})}]}}>{children}</Animated.View>;
}

const badgeNames:Record<string,string>={arsenal:'Arsenal',madrid:'Real Madrid',city:'Manchester City',milan:'AC Milan',juventus:'Juventus',barcelona:'FC Barcelona'};
export function ClubBadge({id,size=130}:{id:string;size?:number}){
 const source=clubCrests[badgeNames[id]??id];
 return <View accessible={false} style={{width:size,height:size*1.15,alignItems:'center',justifyContent:'center'}}>{source?<Image source={source} resizeMode="contain" style={{width:size*.88,height:size}}/>:<Text>Club crest unavailable</Text>}</View>;
}
export function VisualHome({onStart,profile,onCredits,onAlbum,onDaily,dailyDone,today,competitions}:{competitions?:React.ReactNode;today:string;onDaily:()=>void;dailyDone:boolean;onAlbum:()=>void;onStart:(mode:Mode)=>void;profile:Profile;onCredits:()=>void}){
  const completed=(profile.solved??[]).filter(id=>id.startsWith('visual-')).length;
  return <View style={{gap:20,marginBottom:24}}>
    <View style={v.headingRow}><View style={{flex:1}}><Text style={v.eyebrow}>THE VISUAL FOOTBALL QUIZ</Text><Text style={v.heading}>READY FOR KICK-OFF?</Text></View><View style={v.progressPill}><Icon name="football" size={16}/><Text style={v.progressText}>{completed}/{questions.length}</Text></View></View>
    <Reveal identity="spotlight"><Pressable accessibilityRole="button" accessibilityLabel={`Guess the player, ${portraitCount} photo questions`} onPress={()=>onStart('portraits')} style={({pressed})=>[v.spotlight,pressed&&v.pressed]}>
      <Image source={visualImages.wembley} style={StyleSheet.absoluteFill} resizeMode="cover" accessible={false}/>
      <LinearGradient colors={['rgba(6,43,86,.85)','rgba(10,63,102,.36)']} style={StyleSheet.absoluteFill}/>
      <View style={v.heroTop}><View style={v.heroCopy}><Text style={v.heroTag}>PLAYER SPOTLIGHT</Text><Text style={v.heroTitle}>KNOW THE FACE?</Text><Text style={v.heroSub}>Stars, icons and trailblazers. How many can you name?</Text></View>
      <View accessible={false} style={v.photoStack}><View style={[v.playerCard,{transform:[{rotate:'12deg'}],right:-5,top:17}]}><Image source={visualImages.ronaldo} style={v.cardPhoto}/></View><View style={[v.playerCard,{transform:[{rotate:'-9deg'}],right:14,top:0}]}><Image source={visualImages.messi} style={v.cardPhoto}/><View style={v.mystery}><Text style={v.mysteryText}>?</Text></View></View></View></View>
      <View style={v.playButton}><Text style={v.playText}>Guess the player</Text><Icon name="arrow-forward" size={20} color={C.navy}/></View>
    </Pressable></Reveal>
    <DailyChallenge profile={profile} today={today} completed={dailyDone} onPlay={onDaily}/>
    {competitions}
    <View style={v.headingRow}><Text style={v.sectionTitle}>Pick your challenge</Text><Text style={v.small}>Play free · All levels</Text></View>
    <View style={v.challengeRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Guess the badge, 6 club puzzles" onPress={()=>onStart('badges')} style={({pressed})=>[v.challenge,{backgroundColor:'#183F69'},pressed&&v.pressed]}>
        <View style={v.badgePair}><View style={{transform:[{rotate:'-13deg'}],marginRight:-13}}><ClubBadge id="arsenal" size={67}/></View><View style={{transform:[{rotate:'12deg'}]}}><ClubBadge id="madrid" size={67}/></View></View>
        <Text style={v.cardTitle}>Guess the badge</Text><Text style={v.cardSub}>6 authentic club crests</Text><View style={v.cardFooter}><Text style={v.cardTag}>CLUB CULTURE</Text><Icon name="arrow-forward-circle" size={27}/></View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Stadium tour, ${stadiumCount} visual questions`} onPress={()=>onStart('stadiums')} style={({pressed})=>[v.challenge,{backgroundColor:'#1C567D'},pressed&&v.pressed]}>
        <Image source={visualImages.wembley} style={v.stadiumThumb} resizeMode="cover" accessible={false}/>
        <Text style={v.cardTitle}>Stadium tour</Text><Text style={v.cardSub}>{stadiumCount} iconic grounds to name</Text><View style={v.cardFooter}><Text style={v.cardTag}>AWAY DAYS</Text><Icon name="arrow-forward-circle" size={27}/></View>
      </Pressable>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Club connections, ${connectionQuestions.length} puzzles`} onPress={()=>onStart('connections')} style={({pressed})=>[{backgroundColor:'#103D3B',padding:20,borderRadius:18,gap:10},pressed&&v.pressed]}><View style={v.headingRow}><Icon name="git-branch-outline" color="#FFDB45" size={26}/><Text style={{color:'#FFDB45',fontSize:11,fontWeight:'800'}}>{connectionQuestions.length} CONNECTIONS</Text></View><Text style={[v.cardTitle,{color:'white',fontSize:23}]}>Different shirts. Same player.</Text><Text style={{color:'#C4D6D0',fontSize:13,lineHeight:20}}>Connect the clubs to uncover the footballer.</Text><View style={v.cardFooter}><Text style={{color:'white',fontWeight:'800'}}>Play club connections</Text><Icon name="arrow-forward" color="white" size={23}/></View></Pressable>
    <Pressable accessibilityRole="button" onPress={onAlbum} accessibilityLabel="Open player album" style={{paddingVertical:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderColor:C.line}}><View style={{gap:5}}><Text style={v.sectionTitle}>Fill your player album</Text><Text style={v.small}>World stars · Game changers · The greats</Text></View><Icon name="albums-outline" size={27}/></Pressable>
    <Pressable onPress={onCredits} accessibilityRole="button" accessibilityLabel="Artwork credits" style={{minHeight:44,flexDirection:"row",gap:7,alignItems:"center",justifyContent:"center"}}><Icon name="information-circle-outline" size={18}/><Text style={v.small}>Artwork credits</Text></Pressable>
  </View>;
}

export function VisualQuestion({question,answered,correct}:{question:Question;answered:boolean;correct:boolean}){
  const [failed,setFailed]=useState(false),[textClue,setTextClue]=useState(false);
  const visual=question.visual!;
  useEffect(()=>{setFailed(false);setTextClue(false);},[question.id]);
  const credit=credits.find(c=>c.id===visual.key);
  return <Reveal identity={question.id}><View style={v.visualWrap}>
    <View testID="visual-question" style={[v.visualFrame,visual.kind==='portrait'&&{height:285,borderColor:C.gold,borderWidth:4,borderBottomWidth:8,borderBottomLeftRadius:42,borderBottomRightRadius:42},visual.kind==='badge'&&{backgroundColor:'#154D6B'}]}>
      {failed||textClue?<View style={v.textClue}><Icon name="bulb-outline" size={30}/><Text style={v.clueText}>{visual.description}</Text><Text style={v.small}>{question.hint}</Text></View>:visual.kind==='badge'?<ClubBadge id={visual.key} size={155}/>:<Image source={visualImages[visual.key]} resizeMode={visual.kind==='portrait'?'contain':'cover'} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'},visual.key==='allianz'&&!answered&&{width:'200%',height:'200%',right:undefined,bottom:undefined}]} accessibilityLabel={visual.description} onError={()=>setFailed(true)}/>}
      <View style={v.visualLabel}><Text style={v.visualLabelText}>{visual.kind==='portrait'?'NAME THE PLAYER':visual.kind==='badge'?'NAME THE CLUB':'NAME THE GROUND'}</Text></View>
      {answered&&<View style={[v.answerStamp,{backgroundColor:correct?'#166F66':'#4B6170'}]}><Icon name={correct?'checkmark':'book-outline'} color="white" size={18}/><Text style={v.stampText}>{correct?'NAILED IT':'ONE TO REMEMBER'}</Text></View>}
    </View>
    <View style={v.headingRow}><Text style={[v.small,{flex:1,fontSize:10}]}>{credit?`Photo: ${credit.creator} · ${credit.license}`:visual.kind==='badge'?'Club crest · rights belong to the club':'Original stadium illustration'}</Text><Pressable accessibilityRole="button" accessibilityLabel={textClue?'Show visual clue':'Use text clue'} onPress={()=>setTextClue(!textClue)} style={{minHeight:44,justifyContent:'center'}}><Text style={v.textToggle}>{textClue?'Show image':'Text clue'}</Text></Pressable></View>
  </View></Reveal>;
}

export function GoalCelebration({perfect}:{perfect:boolean}){
  const reduced=useReducedMotion(),motion=useRef(new Animated.Value(0)).current;
  useEffect(()=>{motion.setValue(0);if(reduced)return;const a=Animated.timing(motion,{toValue:1,duration:1300,useNativeDriver:true});a.start();return()=>a.stop();},[reduced,motion]);
  return <View style={v.celebration} accessible={false}>
    {!reduced&&Array.from({length:16},(_,i)=><Animated.View key={i} style={{position:'absolute',left:`${5+i*6}%`,top:0,width:7,height:14,borderRadius:2,backgroundColor:['#FFDB45','#54A897','#AE267D'][i%3],opacity:motion.interpolate({inputRange:[0,.1,.75,1],outputRange:[0,1,1,0]}),transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[-20,120+(i%4)*18]})},{rotate:motion.interpolate({inputRange:[0,1],outputRange:['0deg',`${i%2?240:-240}deg`]})}]}}/>)}
    <View style={v.resultBall}><Icon name={perfect?'trophy':'football'} size={60} color="#123A40"/></View>
    <Text style={v.resultWord}>{perfect?'TOP BINS.':'FINAL WHISTLE.'}</Text>
  </View>;
}

export function ArtworkCredits({onOpen}:{onOpen:(url:string)=>void}){
  const [showFontLicense,setShowFontLicense]=useState(false);
  return <View style={{gap:18}}><Text style={v.heading}>Artwork credits</Text><Text style={v.sectionTitle}>Bundled font archive</Text><Text style={v.small}>The game uses your device’s sans-serif typeface. Archived Cormorant assets are copyright 2015 the Cormorant Project Authors, licensed under the SIL Open Font License, Version 1.1.</Text><Pressable accessibilityRole="button" accessibilityState={{expanded:showFontLicense}} onPress={()=>setShowFontLicense(value=>!value)} style={{minHeight:44,justifyContent:"center"}}><Text style={v.textToggle}>{showFontLicense?"Hide font licence":"Read font licence"}</Text></Pressable>{showFontLicense&&<Text selectable style={v.small}>{cormorantLicense.text}</Text>}<Text style={v.small}>Nationality flags: Twemoji by Twitter, Inc. and other contributors. Unmodified artwork, CC BY 4.0.</Text><Pressable accessibilityRole="link" onPress={()=>onOpen("https://github.com/jdecked/twemoji")} style={{minHeight:44,justifyContent:"center"}}><Text style={v.textToggle}>Flag artwork source</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>onOpen("https://creativecommons.org/licenses/by/4.0/")} style={{minHeight:44,justifyContent:"center"}}><Text style={v.textToggle}>Flag artwork licence</Text></Pressable><Text style={v.small}>Photographs remain under the licences below. Images are displayed with layout cropping; the downloaded player files are unchanged. No player, photographer or club endorsement is implied.</Text>{credits.map(c=><View key={c.id} style={{gap:6,borderBottomWidth:1,borderColor:C.line,paddingBottom:12}}><Text style={v.sectionTitle}>{c.file}</Text><Text style={v.small}>{c.creator} · {c.license}</Text><View style={{flexDirection:'row',gap:20}}><Pressable accessibilityRole="link" onPress={()=>onOpen(c.source)} style={{minHeight:44,justifyContent:'center'}}><Text style={v.textToggle}>Source & original</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>onOpen(c.licenseUrl)} style={{minHeight:44,justifyContent:'center'}}><Text style={v.textToggle}>Licence</Text></Pressable></View></View>)}<Text style={v.small}>Stadium spotlight: original AI-generated illustration. Club crests are authentic club marks. Rights remain with their respective clubs. Shirts illustrate traditional club colours.</Text><Pressable accessibilityRole="link" onPress={()=>onOpen("https://github.com/luukhopman/football-logos")} style={{minHeight:44,justifyContent:"center"}}><Text style={v.textToggle}>Club crest sources</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>onOpen("https://www.uefa.com/uefachampionsleague/clubs/")} style={{minHeight:44,justifyContent:"center"}}><Text style={v.textToggle}>UEFA club crests</Text></Pressable></View>;
}

const v=StyleSheet.create({
  headingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'},
  eyebrow:{fontSize:10,letterSpacing:1.5,fontWeight:'900',color:C.lime,marginBottom:6},
  heading:{fontSize:26,lineHeight:30,fontWeight:'900',letterSpacing:-.7,color:C.white},
  progressPill:{flexDirection:'row',gap:5,padding:9,borderRadius:10,backgroundColor:C.navy,borderWidth:1,borderColor:'#65A5D0'},
  progressText:{fontSize:11,fontWeight:'900',color:C.lime},
  spotlight:{minHeight:260,borderRadius:22,borderWidth:2,borderBottomWidth:5,borderColor:C.gold,borderBottomColor:'#92712E',overflow:'hidden',backgroundColor:C.panel,padding:18},
  heroTop:{flexDirection:'row',gap:14,alignItems:'center',minHeight:172},
  heroCopy:{flex:1,gap:10},
  heroTag:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:C.lime},
  heroTitle:{fontSize:30,lineHeight:33,fontWeight:'900',letterSpacing:-.7,color:C.white},
  heroSub:{fontSize:13,lineHeight:19,color:'#E0EFF9',maxWidth:210},
  playButton:{backgroundColor:C.lime,paddingHorizontal:16,paddingVertical:14,borderRadius:12,borderWidth:1,borderBottomWidth:4,borderColor:'#FFF1B4',borderBottomColor:'#BA8A21',flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7,marginTop:16},
  playText:{fontSize:15,fontWeight:'900',color:C.navy},
  photoStack:{width:104,height:168,flexShrink:0},
  playerCard:{position:'absolute',width:91,height:151,borderWidth:4,borderColor:'#F7D981',borderTopLeftRadius:14,borderTopRightRadius:14,borderBottomLeftRadius:28,borderBottomRightRadius:28,overflow:'hidden',backgroundColor:C.navy},
  cardPhoto:{width:'100%',height:'100%'},
  mystery:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#FFDB45',alignItems:'center',height:27},
  mysteryText:{fontWeight:'900',fontSize:21,color:'#173B40'},
  pressed:{transform:[{scale:.98}],opacity:.92},
  sectionTitle:{fontSize:18,fontWeight:'900',color:C.white,letterSpacing:-.3},
  small:{fontSize:12,lineHeight:18,color:C.muted},
  challengeRow:{flexDirection:'row',gap:12},
  challenge:{flex:1,minWidth:0,padding:13,borderRadius:18,borderWidth:2,borderBottomWidth:5,borderColor:'#73ACCC',borderBottomColor:C.navy,overflow:'hidden'},
  badgePair:{height:100,flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:8},
  stadiumThumb:{height:100,width:'100%',borderRadius:10,marginBottom:8},
  cardTitle:{fontSize:18,fontWeight:'900',color:C.white,letterSpacing:-.4},
  cardSub:{fontSize:12,lineHeight:18,color:C.muted,marginTop:5},
  cardFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10},
  cardTag:{fontSize:9,letterSpacing:.5,fontWeight:'800',color:C.lime},
  collection:{gap:12},
  lineup:{flexDirection:'row',gap:7},
  miniCard:{flex:1,height:99,borderRadius:10,backgroundColor:'#D5DFE1',overflow:'hidden'},
  miniPhoto:{width:'100%',height:'100%'},
  number:{position:'absolute',left:4,bottom:4,backgroundColor:'#FFDB45',borderRadius:4,paddingHorizontal:4,paddingVertical:2},
  numberText:{fontSize:9,fontWeight:'900',color:'#132B38'},
  visualWrap:{marginBottom:12},
  visualFrame:{height:250,borderRadius:22,borderWidth:2,borderColor:'#8AC5D9',overflow:'hidden',alignItems:'center',justifyContent:'center',backgroundColor:C.navy},
  visualLabel:{position:'absolute',top:12,left:12,backgroundColor:'rgba(7,30,40,.8)',paddingHorizontal:9,paddingVertical:6,borderRadius:6},
  visualLabelText:{fontSize:10,letterSpacing:1,fontWeight:'900',color:C.white},
  answerStamp:{position:'absolute',bottom:12,right:12,flexDirection:'row',alignItems:'center',gap:6,padding:9,borderRadius:8},
  stampText:{color:'white',fontSize:10,fontWeight:'900'},
  textClue:{padding:22,gap:10,alignItems:'center',backgroundColor:'#144B68',width:'100%',height:'100%',justifyContent:'center'},
  clueText:{fontSize:16,lineHeight:23,color:C.ink,textAlign:'center'},
  textToggle:{fontSize:12,fontWeight:'800',color:C.green},
  celebration:{width:'100%',height:165,alignItems:'center',justifyContent:'center',gap:9},
  resultBall:{width:108,height:108,backgroundColor:C.lime,borderWidth:4,borderColor:'#FFF1B1',borderRadius:32,alignItems:'center',justifyContent:'center',transform:[{rotate:'-8deg'}]},
  resultWord:{fontSize:22,fontWeight:'900',letterSpacing:1,color:C.lime}
});
