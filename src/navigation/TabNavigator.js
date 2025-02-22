// navigation/TabNavigator.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import { createStackNavigator } from "@react-navigation/stack";

import SearchScreen from "../screens/SearchScreen";
import NearbyScreen from "../screens/NearbyScreen";
import PharmacyDetailsScreen from "../screens/PharmacyDetailsScreen";
import SelectCityScreen from "../screens/SelectCityScreen";

import { COLORS } from "../constants/colors";

const Tab = createBottomTabNavigator();
const SearchStack = createStackNavigator();
const NearbyStack = createStackNavigator();

// Stack Navigator for Search
const SearchStackNavigator = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitleVisible: false, // Geri buton yazısını kaldır
        headerBackTitle: "",
      }}>
      <SearchStack.Screen
        name="SearchList"
        component={SearchScreen}
        options={{ title: "Arama" }}
      />
      <SearchStack.Screen
        name="SelectCity"
        component={SelectCityScreen}
        options={{ title: "" }}
      />
      <SearchStack.Screen
        name="PharmacyDetails"
        component={PharmacyDetailsScreen}
        options={{ title: "Eczane Detayları" }}
      />
    </SearchStack.Navigator>
  );
};

// Stack Navigator for Nearby
const NearbyStackNavigator = () => {
  return (
    <NearbyStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitleVisible: false, // Geri buton yazısını kaldır
        headerBackTitle: "",
      }}>
      <NearbyStack.Screen
        name="NearbyMap"
        component={NearbyScreen}
        options={{ title: "Harita" }}
      />
      <NearbyStack.Screen
        name="PharmacyDetails"
        component={PharmacyDetailsScreen}
        options={{ title: "Eczane Detayları" }}
      />
      <NearbyStack.Screen
        name="SelectCity"
        component={SelectCityScreen}
        options={{ title: "" }}
      />
    </NearbyStack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Search"
      screenOptions={({ route }) => ({
        headerShown: false, // Alt sekmeler için header'ı gizle
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Search") {
            iconName = "search";
          } else if (route.name === "Nearby") {
            iconName = "map-marker";
          }

          return (
            <Icon
              name={iconName}
              type="font-awesome"
              color={color}
              size={size}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 5,
        },
      })}>
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{ tabBarLabel: "Ara" }} // Tab etiketini "Ara" olarak değiştir
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyStackNavigator}
        options={{ tabBarLabel: "Harita" }} // Tab etiketini "Harita" olarak değiştir
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
