import { View, Text, ImageBackground, StatusBar, Platform } from 'react-native'
import React, { useEffect } from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';


const _layout = () => {
  // Ensure StatusBar is visible in the tabs layout
  useEffect(() => {
    // Make sure StatusBar is visible
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FAFAFA');
      StatusBar.setTranslucent(true);
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          paddingTop: 3,
          borderRadius: 10,
          elevation: 10,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          height: 70,
          paddingHorizontal: 10,
        },
        tabBarLabelStyle:{
          fontSize: 10,
          fontWeight: "bold",
          color: "#000",
        },
        tabBarItemStyle: {
          paddingBottom: 5,
        },
        headerShown: false
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Home",
          tabBarLabel: "Home",
          headerShown:false,
          
          tabBarIcon: ({ focused }) => (
            <View className="w-[55px] flex-column items-center ">
                
                  {focused ? (
                      <Ionicons name="home" size={24}   color="#666" />
                    ) : (
                      <Ionicons name="home-outline" size={24} color="#666" />
                    )}
                    {/* <Text className="text-black font-bold text-sm mt-1"
                    >Home</Text> */}
            </View>
          ) 
        }}
        
      />

      <Tabs.Screen 
        name="categories" 
        options={{ 
          title: "Categories",
          headerShown: false, 
          tabBarLabel: "Categories",
          tabBarIcon: ({ focused }) => (
            <View className=" w-[55px] flex-column items-center ">
              
                {focused ? (
                  <Ionicons name="grid" size={24} color="#666" />
                ) : (
                  <Ionicons name="grid-outline" size={24} color="#666" />
                )}
                {/* <Text className="text-black font-bold text-sm mt-1">Category</Text> */}
            </View>
          )
        }}
      />

      <Tabs.Screen 
        name="Search" 
        options={{ 
          title: "Search",
          headerShown: false, 
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <View style={{
              top: -10,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#FFCC00",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}>
              <Ionicons 
                name={focused ? "search" : "search-outline"} 
                size={27} 
                color="#666" 
              />
            </View>
          )
        }}
      />
      <Tabs.Screen 
        name="Orders" 
        options={{ 
          title: "Orders", 
          headerShown:false,
          tabBarLabel: "Orders",
          tabBarIcon: ({ focused }) => (
            <View className="flex-column w-[55px] items-center "> 
             
                {focused ? (
                  <Ionicons name="list-circle-sharp" size={28} color="#666" />
                ) : (
                  <Ionicons name="list-circle-outline" size={28} color="#666" />
                )}
                
            </View>
          )
          
        }}
      />
      <Tabs.Screen 
        name="Profile" 
        options={{ 
          title: "Profile", 
          headerShown:false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <View className="flex-column w-[55px] items-center ">

                {focused ? (
                  <Ionicons name="person-circle-sharp" size={27} color="#666" />
                ) : (
                  <Ionicons name="person-circle-outline" size={27} color="#666" />
                )}
               
            </View> 
          )
        }}
      />
    </Tabs>
  )
}


export default _layout