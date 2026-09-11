import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {C, Icon} from './ui';
import type {Mode, Profile, Question} from './core/quiz';
import baseCredits from '../assets/visual/credits.json';
import playerCredits from '../assets/players/manifest.json';
import questions from './content/visual-questions.json';
import {playerImages} from './playerImages';
const credits=[...baseCredits,...playerCredits];
const portraitCount=questions.filter(q=>q.category==='portraits').length;

export const visualImages: Record<string, ImageSourcePropType> = {
  ...playerImages,
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

const badgeStyle:Record<string,{base:string;stripe:string;icon:'boat'|'star'|'football'|'ribbon';label:string}>= {
  arsenal:{base:'#AD3038',stripe:'#D7A64C',icon:'ribbon',label:'CANNON'},
  madrid:{base:'#F8F5E8',stripe:'#345CAC',icon:'star',label:'CROWN'},
  city:{base:'#8CC3E4',stripe:'#FFFFFF',icon:'boat',label:'SHIP'},
  milan:{base:'#AF343B',stripe:'#202730',icon:'football',label:'STRIPES'},
  juventus:{base:'#F1F0E9',stripe:'#202730',icon:'star',label:'STRIPES'},
  barcelona:{base:'#932F56',stripe:'#274B8E',icon:'football',label:'COLOURS'},
};
export function ClubBadge({id,size=130}:{id:string;size?:number}){
  const b=badgeStyle[id]??badgeStyle.arsenal;
  return <View accessible={false} style={{width:size,height:size*1.15,alignItems:'center',justifyContent:'center'}}>
    <View style={{width:size*.86,height:size,borderRadius:id==='city'?size/2:22,borderBottomLeftRadius:size*.42,borderBottomRightRadius:size*.42,backgroundColor:b.base,borderColor:'#D7B974',borderWidth:4,overflow:'hidden',alignItems:'center',justifyContent:'center'}}>
      <View style={{position:'absolute',width:size*.28,height:size*1.3,backgroundColor:b.stripe,transform:[{rotate:id==='madrid'?'35deg':'0deg'}]}}/>
      {id==='arsenal'?<View style={{width:size*.62,alignItems:'center'}}><View style={{width:'100%',height:size*.12,backgroundColor:'#E9C977',borderRadius:4,transform:[{rotate:'-8deg'}]}}/><View style={{flexDirection:'row',gap:size*.14,marginTop:2}}>{[0,1].map(i=><View key={i} style={{width:size*.19,height:size*.19,borderWidth:3,borderColor:'#E9C977',borderRadius:size*.1}}/>)}</View></View>:<Icon name={b.icon} color={id==='city'?'#A27928':'#E9C977'} size={size*.47}/>}
    </View>
    {id==='madrid'&&<View style={{position:'absolute',top:-4,flexDirection:'row'}}>{[0,1,2].map(i=><View key={i} style={{width:size*.16,height:size*.18,backgroundColor:'#D9AF4F',borderTopLeftRadius:4,borderTopRightRadius:4,transform:[{rotate:`${(i-1)*18}deg`}]}}/>)}</View>}
  </View>;
}

export function VisualHome({onStart,profile,onCredits}:{onStart:(mode:Mode)=>void;profile:Profile;onCredits:()=>void}){
  const completed=profile.seen.filter(id=>id.startsWith('visual-')).length;
  return <View style={{gap:20,marginBottom:24}}>
    <View style={v.headingRow}><View><Text style={v.eyebrow}>THE VISUAL FOOTBALL QUIZ</Text><Text style={v.heading}>Football in your DNA?</Text></View><View style={v.progressPill}><Icon name="football" size={16}/><Text style={v.progressText}>{completed}/{questions.length}</Text></View></View>
    <Reveal identity="spotlight"><Pressable accessibilityRole="button" accessibilityLabel={`Guess the player, ${portraitCount} photo questions`} onPress={()=>onStart('portraits')} style={({pressed})=>[v.spotlight,pressed&&v.pressed]}>
      <Image source={visualImages.wembley} style={StyleSheet.absoluteFill} resizeMode="cover" accessible={false}/>
      <LinearGradient colors={['rgba(7,30,40,.9)','rgba(7,30,40,.56)']} style={StyleSheet.absoluteFill}/>
      <View style={v.heroCopy}><Text style={v.heroTag}>PLAYER SPOTLIGHT</Text><Text style={v.heroTitle}>Name that{"\n"}legend.</Text><Text style={v.heroSub}>Stars, icons and trailblazers. How many can you name?</Text><View style={v.playButton}><Text style={v.playText}>Guess the player</Text><Icon name="arrow-forward" size={20}/></View></View>
      <View accessible={false} style={v.photoStack}><View style={[v.playerCard,{transform:[{rotate:'12deg'}],right:-12,top:23}]}><Image source={visualImages.ronaldo} style={v.cardPhoto}/></View><View style={[v.playerCard,{transform:[{rotate:'-9deg'}],right:30,top:3}]}><Image source={visualImages.messi} style={v.cardPhoto}/><View style={v.mystery}><Text style={v.mysteryText}>?</Text></View></View></View>
    </Pressable></Reveal>
    <View style={v.headingRow}><Text style={v.sectionTitle}>Pick your challenge</Text><Text style={v.small}>Play free · All levels</Text></View>
    <View style={v.challengeRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Guess the badge, 6 club puzzles" onPress={()=>onStart('badges')} style={({pressed})=>[v.challenge,{backgroundColor:'#E4ECE9'},pressed&&v.pressed]}>
        <View style={v.badgePair}><View style={{transform:[{rotate:'-13deg'}],marginRight:-13}}><ClubBadge id="arsenal" size={67}/></View><View style={{transform:[{rotate:'12deg'}]}}><ClubBadge id="madrid" size={67}/></View></View>
        <Text style={v.cardTitle}>Guess the badge</Text><Text style={v.cardSub}>6 reimagined club crests</Text><View style={v.cardFooter}><Text style={v.cardTag}>CLUB CULTURE</Text><Icon name="arrow-forward-circle" size={27}/></View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Stadium tour, 3 visual questions" onPress={()=>onStart('stadiums')} style={({pressed})=>[v.challenge,{backgroundColor:'#DDE9EE'},pressed&&v.pressed]}>
        <Image source={visualImages.wembley} style={v.stadiumThumb} resizeMode="cover" accessible={false}/>
        <Text style={v.cardTitle}>Stadium tour</Text><Text style={v.cardSub}>3 iconic grounds to name</Text><View style={v.cardFooter}><Text style={v.cardTag}>AWAY DAYS</Text><Icon name="arrow-forward-circle" size={27}/></View>
      </Pressable>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Club connections, 6 puzzles" onPress={()=>onStart('connections')} style={({pressed})=>[{backgroundColor:'#103D3B',padding:20,borderRadius:18,gap:10},pressed&&v.pressed]}><View style={v.headingRow}><Icon name="git-branch-outline" color="#F4CF55" size={26}/><Text style={{color:'#F4CF55',fontSize:11,fontWeight:'800'}}>6 CONNECTIONS</Text></View><Text style={[v.cardTitle,{color:'white',fontSize:23}]}>Different shirts. Same player.</Text><Text style={{color:'#C4D6D0',fontSize:13,lineHeight:20}}>Connect the clubs to uncover the footballer.</Text><View style={v.cardFooter}><Text style={{color:'white',fontWeight:'800'}}>Play club connections</Text><Icon name="arrow-forward" color="white" size={23}/></View></Pressable>
    <View style={v.collection}><View style={v.headingRow}><Text style={v.sectionTitle}>Across the generations</Text><Icon name="sparkles-outline" size={19}/></View><View style={v.lineup}>{['bellingham','bonmati','ronaldinho','kerr','henry'].map((key,i)=><Pressable key={key} accessibilityRole="button" accessibilityLabel={`Play player gallery, portrait ${i+1}`} onPress={()=>onStart('portraits')} style={v.miniCard}><Image source={visualImages[key]} style={v.miniPhoto} accessible={false}/><View style={v.number}><Text style={v.numberText}>{String(i+1).padStart(2,'0')}</Text></View></Pressable>)}</View><View style={v.headingRow}><Text style={v.small}>A face you know. A name to remember.</Text><Pressable onPress={onCredits} accessibilityRole="button" accessibilityLabel="Artwork credits" style={{minHeight:44,justifyContent:'center'}}><Icon name="information-circle-outline" size={20}/></Pressable></View></View>
  </View>;
}

export function VisualQuestion({question,answered,correct}:{question:Question;answered:boolean;correct:boolean}){
  const [failed,setFailed]=useState(false),[textClue,setTextClue]=useState(false);
  const visual=question.visual!;
  useEffect(()=>{setFailed(false);setTextClue(false);},[question.id]);
  const credit=credits.find(c=>c.id===visual.key);
  return <Reveal identity={question.id}><View style={v.visualWrap}>
    <View testID="visual-question" style={[v.visualFrame,visual.kind==='portrait'&&{height:255},visual.kind==='badge'&&{backgroundColor:'#E9EEE9'}]}>
      {failed||textClue?<View style={v.textClue}><Icon name="bulb-outline" size={30}/><Text style={v.clueText}>{visual.description}</Text><Text style={v.small}>{question.hint}</Text></View>:visual.kind==='badge'?<ClubBadge id={visual.key} size={155}/>:<Image source={visualImages[visual.key]} resizeMode={visual.kind==='portrait'?'contain':'cover'} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'},visual.key==='allianz'&&!answered&&{width:'200%',height:'200%',right:undefined,bottom:undefined}]} accessibilityLabel={visual.description} onError={()=>setFailed(true)}/>}
      <View style={v.visualLabel}><Text style={v.visualLabelText}>{visual.kind==='portrait'?'NAME THE PLAYER':visual.kind==='badge'?'REIMAGINED CREST':'NAME THE GROUND'}</Text></View>
      {answered&&<View style={[v.answerStamp,{backgroundColor:correct?'#166F66':'#4B6170'}]}><Icon name={correct?'checkmark':'book-outline'} color="white" size={18}/><Text style={v.stampText}>{correct?'NAILED IT':'ONE TO REMEMBER'}</Text></View>}
    </View>
    <View style={v.headingRow}><Text style={[v.small,{flex:1,fontSize:10}]}>{credit?`Photo: ${credit.creator} · ${credit.license}`:visual.kind==='badge'?'Original puzzle artwork · unofficial crest':'Original stadium illustration'}</Text><Pressable accessibilityRole="button" accessibilityLabel={textClue?'Show visual clue':'Use text clue'} onPress={()=>setTextClue(!textClue)} style={{minHeight:44,justifyContent:'center'}}><Text style={v.textToggle}>{textClue?'Show image':'Text clue'}</Text></Pressable></View>
  </View></Reveal>;
}

export function GoalCelebration({perfect}:{perfect:boolean}){
  const reduced=useReducedMotion(),motion=useRef(new Animated.Value(0)).current;
  useEffect(()=>{motion.setValue(0);if(reduced)return;const a=Animated.timing(motion,{toValue:1,duration:1300,useNativeDriver:true});a.start();return()=>a.stop();},[reduced,motion]);
  return <View style={v.celebration} accessible={false}>
    {!reduced&&Array.from({length:16},(_,i)=><Animated.View key={i} style={{position:'absolute',left:`${5+i*6}%`,top:0,width:7,height:14,borderRadius:2,backgroundColor:['#F4CF55','#54A897','#EC8C76'][i%3],opacity:motion.interpolate({inputRange:[0,.1,.75,1],outputRange:[0,1,1,0]}),transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[-20,120+(i%4)*18]})},{rotate:motion.interpolate({inputRange:[0,1],outputRange:['0deg',`${i%2?240:-240}deg`]})}]}}/>)}
    <View style={v.resultBall}><Icon name={perfect?'trophy':'football'} size={60} color="#123A40"/></View>
    <Text style={v.resultWord}>{perfect?'TOP BINS.':'FINAL WHISTLE.'}</Text>
  </View>;
}

export function ArtworkCredits({onOpen}:{onOpen:(url:string)=>void}){
  return <View style={{gap:18}}><Text style={v.heading}>Artwork credits</Text><Text style={v.small}>Photographs remain under the licences below. Images are displayed with layout cropping; the downloaded player files are unchanged. No player, photographer or club endorsement is implied.</Text>{credits.map(c=><View key={c.id} style={{gap:6,borderBottomWidth:1,borderColor:C.line,paddingBottom:12}}><Text style={v.sectionTitle}>{c.file}</Text><Text style={v.small}>{c.creator} · {c.license}</Text><View style={{flexDirection:'row',gap:20}}><Pressable accessibilityRole="link" onPress={()=>onOpen(c.source)} style={{minHeight:44,justifyContent:'center'}}><Text style={v.textToggle}>Source & original</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>onOpen(c.licenseUrl)} style={{minHeight:44,justifyContent:'center'}}><Text style={v.textToggle}>Licence</Text></Pressable></View></View>)}<Text style={v.small}>Stadium spotlight: original AI-generated illustration. Club badges: original code-drawn puzzles, not official club crests.</Text></View>;
}

const v=StyleSheet.create({
  headingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},eyebrow:{fontSize:9,letterSpacing:1.8,fontWeight:'800',color:C.green,marginBottom:7},heading:{fontSize:26,lineHeight:32,fontWeight:'900',letterSpacing:-1,color:C.ink},progressPill:{flexDirection:'row',gap:5,padding:8,borderRadius:20,backgroundColor:'#E3EAE5'},progressText:{fontSize:11,fontWeight:'800',color:C.ink},spotlight:{minHeight:245,borderRadius:22,overflow:'hidden',backgroundColor:'#0B3038',padding:21},heroCopy:{zIndex:2,width:'64%',gap:12},heroTag:{fontSize:9,fontWeight:'900',letterSpacing:1.4,color:'#F4CF55'},heroTitle:{fontSize:30,lineHeight:33,fontWeight:'900',letterSpacing:-1,color:'#FFFFFF'},heroSub:{fontSize:12,lineHeight:18,color:'#DAE8E7',maxWidth:150},playButton:{backgroundColor:'#F4CF55',paddingHorizontal:13,paddingVertical:12,borderRadius:11,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7,alignSelf:'flex-start'},playText:{fontSize:12,fontWeight:'900',color:'#132B38'},photoStack:{position:'absolute',right:3,top:39,width:125,height:200},playerCard:{position:'absolute',width:98,height:161,borderWidth:4,borderColor:'#EEE6CC',borderRadius:12,overflow:'hidden',backgroundColor:'#92ABAD'},cardPhoto:{width:'100%',height:'100%'},mystery:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#F4CF55',alignItems:'center',height:27},mysteryText:{fontWeight:'900',fontSize:21,color:'#173B40'},pressed:{transform:[{scale:.98}],opacity:.92},sectionTitle:{fontSize:17,fontWeight:'800',color:C.ink,letterSpacing:-.4},small:{fontSize:12,lineHeight:18,color:C.muted},challengeRow:{flexDirection:'row',gap:12},challenge:{flex:1,minWidth:0,padding:13,borderRadius:18,overflow:'hidden'},badgePair:{height:100,flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:8},stadiumThumb:{height:100,width:'100%',borderRadius:10,marginBottom:8},cardTitle:{fontSize:17,fontWeight:'900',color:C.ink,letterSpacing:-.5},cardSub:{fontSize:11,lineHeight:17,color:C.muted,marginTop:4},cardFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10},cardTag:{fontSize:8,letterSpacing:.8,fontWeight:'800',color:C.green},collection:{gap:12},lineup:{flexDirection:'row',gap:7},miniCard:{flex:1,height:99,borderRadius:10,backgroundColor:'#D5DFE1',overflow:'hidden'},miniPhoto:{width:'100%',height:'100%'},number:{position:'absolute',left:4,bottom:4,backgroundColor:'#F4CF55',borderRadius:4,paddingHorizontal:4,paddingVertical:2},numberText:{fontSize:9,fontWeight:'900',color:'#132B38'},visualWrap:{marginBottom:12},visualFrame:{height:235,borderRadius:19,overflow:'hidden',alignItems:'center',justifyContent:'center',backgroundColor:'#183D46'},visualLabel:{position:'absolute',top:12,left:12,backgroundColor:'rgba(7,30,40,.8)',paddingHorizontal:9,paddingVertical:6,borderRadius:6},visualLabelText:{fontSize:8,letterSpacing:1.2,fontWeight:'800',color:'white'},answerStamp:{position:'absolute',bottom:12,right:12,flexDirection:'row',alignItems:'center',gap:6,padding:9,borderRadius:8},stampText:{color:'white',fontSize:10,fontWeight:'900'},textClue:{padding:22,gap:10,alignItems:'center',backgroundColor:'#E5EDE9',width:'100%',height:'100%',justifyContent:'center'},clueText:{fontSize:16,lineHeight:23,color:C.ink,textAlign:'center'},textToggle:{fontSize:12,fontWeight:'800',color:C.green},celebration:{width:'100%',height:165,alignItems:'center',justifyContent:'center',gap:9},resultBall:{width:108,height:108,backgroundColor:'#F4CF55',borderRadius:30,alignItems:'center',justifyContent:'center',transform:[{rotate:'-8deg'}]},resultWord:{fontSize:16,fontWeight:'900',letterSpacing:2,color:C.green}
});
