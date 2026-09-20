import {Text} from './Typography';
import React,{useState} from 'react';
import {View} from 'react-native';
import type {Question} from './core/quiz';
import {Button,C,s} from './ui';
import {VisualQuestion} from './VisualExperience';
import {ClubConnections} from './ClubConnections';
import {SquadClue} from './SquadArchive';

export function MistakeReview({items,largeText,onPractise,onSource}:{items:Question[];largeText:boolean;onPractise:(id:string)=>void;onSource:(url:string)=>void}){
 const [limit,setLimit]=useState(6);
 const text={fontSize:largeText?20:16,lineHeight:largeText?30:24};
 return <View style={{gap:24}}>
  {items.slice(0,limit).map(item=><View key={item.id} testID={`review-${item.id}`} style={{backgroundColor:C.panel,borderRadius:16,padding:16,gap:12}}>
   <Text style={s.tiny}>{item.era}</Text>
   {item.visual&&<VisualQuestion question={item} answered correct={false}/>}
   {item.clubConnections&&<ClubConnections clubs={item.clubConnections} identity={`review-${item.id}`}/>}
   {item.squadClue&&<SquadClue {...item.squadClue}/>}
   <Text style={[s.modeTitle,text]}>{item.prompt}</Text>
   <Text style={[text,{color:C.green,fontWeight:'800'}]}>{item.answer}</Text>
   <Text style={[s.body,text]}>{item.explanation}</Text>
   <Button title={`Practise ${item.answer} again`} secondary icon="refresh-outline" onPress={()=>onPractise(item.id)}/>
   <Button title="View source" secondary icon="open-outline" onPress={()=>onSource(item.source)}/>
  </View>)}
  {items.length>limit&&<Button title={`Show more mistakes (${items.length-limit} remaining)`} secondary onPress={()=>setLimit(n=>n+6)}/>}
 </View>;
}
