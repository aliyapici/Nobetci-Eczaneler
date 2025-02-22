// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import TabNavigator from "./src/navigation/TabNavigator";
import { LocationProvider } from "./src/contexts/LocationContext";

const App = () => {
  return (
    <LocationProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </LocationProvider>
  );
};

export default App;
