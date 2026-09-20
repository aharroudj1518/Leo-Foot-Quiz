import React from 'react';
import {Platform,Text as NativeText,TextInput as NativeInput,TextProps,TextInputProps} from 'react-native';

// Native sans-serif faces stay crisp and respect device text scaling.
const family=Platform.select({android:'sans-serif',ios:'System',default:'Arial, Helvetica, sans-serif'});
export function Text({style,...props}:TextProps){return <NativeText {...props} style={[{fontFamily:family},style]}/>;}
export const TextInput=React.forwardRef<NativeInput,TextInputProps>(function TextInput({style,placeholderTextColor='#AFCBDD',...props},ref){return <NativeInput ref={ref} {...props} placeholderTextColor={placeholderTextColor} style={[{fontFamily:family},style]}/>;});
