import React from 'react';
import {Image,StyleSheet,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

/** Decorative only: game content and touch targets remain in the foreground. */
export function StadiumBackdrop({quiz=false}:{quiz?:boolean}){
 return <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill,{overflow:'hidden'}]}>
  <Image source={require('../assets/visual/wembley.png')} resizeMode="cover" style={[StyleSheet.absoluteFill,{width:'100%',height:'100%',opacity:.46}]}/>
  <LinearGradient colors={quiz?['rgba(8,68,91,.94)','rgba(10,115,124,.85)','rgba(5,54,77,.96)']:['rgba(15,91,159,.82)','rgba(8,48,90,.84)','rgba(4,33,53,.95)']} style={StyleSheet.absoluteFill}/>
  <View style={styles.light}/><View style={[styles.light,{left:undefined,right:-100}]}/>
 </View>;
}
const styles=StyleSheet.create({light:{position:'absolute',left:-100,top:190,width:190,height:4,backgroundColor:'#B7E9FF',opacity:.28,transform:[{rotate:'-24deg'}]}});
