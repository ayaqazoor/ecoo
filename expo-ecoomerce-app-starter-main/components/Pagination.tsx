import { StyleSheet, Text, View, } from 'react-native'
import React from 'react';
import { Colors } from '@/constants/Colors';

type Props = {
    items:string[];
    PaginationIndex:number;
}

const Pagination= (props: Props) => {
  return (
    <View style={styles.container}>
        {props.items.map((item, index) =>(
            <View key={index} style={[styles.PaginationDots,{backgroundColor:props.PaginationIndex ===index ? Colors.primary:'#ccc'}]}/>
            
        ))}
        <View style={styles.PaginationNumberContainer}>
            <View style={styles.PaginationNumberBox}> 
            
<Text style={styles.PaginationNumberText}>{props.PaginationIndex +1}/{props.items.length}</Text>
            </View>
             </View>
    </View>
  )
}

export default Pagination

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        height:60,
        justifyContent:'center',
        alignItems:'center',
    },
    PaginationDots:{
        width:30,
        height:4,
        margin:3,
        borderRadius:5,
        
    },
    PaginationNumberContainer:{
        position:'absolute',
        alignItems:'flex-end',
        width:'100%',
        paddingRight:20,
    },
    PaginationNumberBox:{
backgroundColor:Colors.extraLightGray,
paddingHorizontal:8,
paddingVertical:2,
borderRadius:10,
    },
    PaginationNumberText:{
        color:Colors.primary,
        fontSize:13,
    }

});