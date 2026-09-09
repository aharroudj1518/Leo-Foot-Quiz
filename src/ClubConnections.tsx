import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from './ui';
import {Reveal} from './VisualExperience';

export function ClubConnections({clubs,identity}:{clubs:string[];identity:string}) {
  return <Reveal identity={identity}><View style={styles.board} testID="club-connections">
    <Text style={styles.label}>DIFFERENT SHIRTS. SAME PLAYER.</Text>
    {clubs.map((club,index)=><View key={club} style={styles.stop}>
      <View style={styles.number}><Text style={styles.numberText}>{String(index+1).padStart(2,'0')}</Text></View>
      <Text style={styles.club}>{club}</Text>
      <Icon name="shirt-outline" size={22} color="#C4D6D0"/>
    </View>)}
    <Text style={styles.caption}>Find the player who represented every club shown.</Text>
  </View></Reveal>;
}
const styles=StyleSheet.create({
  board:{backgroundColor:'#103D3B',padding:20,borderRadius:18,gap:12,marginBottom:20},
  label:{fontSize:10,fontWeight:'800',letterSpacing:1.3,color:'#F4CF55',marginBottom:4},
  stop:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#3F6461'},
  number:{width:32,height:32,borderRadius:16,backgroundColor:'#F4CF55',alignItems:'center',justifyContent:'center'},
  numberText:{fontSize:12,fontWeight:'900',color:'#103D3B',fontVariant:['tabular-nums']},
  club:{flex:1,color:'#FFFFFF',fontWeight:'700',fontSize:19,lineHeight:26},
  caption:{color:'#C4D6D0',fontSize:12,lineHeight:18,marginTop:4}
});
