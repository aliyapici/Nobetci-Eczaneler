// screens/SelectCityScreen.js

import React, { useContext, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Keyboard,
} from "react-native";
import { SearchBar, Icon } from "react-native-elements"; // Button'ı kaldırdık
import { LocationContext } from "../contexts/LocationContext";
import { COLORS } from "../constants/colors";
import { Text } from "react-native"; // Text'i react-native'den import ediyoruz

const SelectCityScreen = ({ navigation }) => {
  const { cities, setSelectedCity, setSelectedDistrict } =
    useContext(LocationContext);
  const [search, setSearch] = useState("");

  // İl ve ilçe aramasına göre filtreleme
  const filteredData = cities.map((city) => {
    const filteredDistricts = city.ilceleri.filter((district) =>
      district.toLowerCase().includes(search.toLowerCase())
    );
    const isCityMatched = city.il.toLowerCase().includes(search.toLowerCase());

    // Sadece il veya ilçe eşleşiyorsa dahil et
    if (isCityMatched || filteredDistricts.length > 0) {
      return {
        title: city.il,
        data: isCityMatched
          ? [city.il, ...filteredDistricts]
          : filteredDistricts,
      };
    }
    return null;
  });

  const sections = filteredData.filter((section) => section !== null);

  const handleSelection = (item, city) => {
    if (item === city.il) {
      // İl seçildi
      setSelectedCity(city);
      setSelectedDistrict(null);
    } else {
      // İlçe seçildi
      setSelectedCity(city);
      setSelectedDistrict(item);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="İl veya ilçe ara..."
        onChangeText={(text) => {
          const capitalizedText =
            text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
          setSearch(capitalizedText);
        }}
        value={search}
        lightTheme
        round
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
        inputStyle={styles.searchInput}
        onSubmitEditing={Keyboard.dismiss}
        clearIcon={
          <Icon name="close" type="material" size={20} color={COLORS.primary} />
        }
      />
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item, section }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                handleSelection(
                  item,
                  cities.find((c) => c.il === section.title)
                )
              }>
              <Icon
                name={item === section.title ? "city" : "map-marker-circle"}
                type="material-community"
                color={item === section.title ? COLORS.primary : "#555"}
                size={20}
              />
              <Text style={styles.listItemText}>{` ${item}`}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Eşleşen sonuç bulunamadı.</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled" // Keyboard'ın kapanmasını sağlamak için
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Hiçbir il veya ilçe bulunamadı.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  searchBarContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingVertical: 10,
  },
  searchBarInput: {
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  searchInput: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  sectionHeader: {
    padding: 10,
    backgroundColor: COLORS.primary,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightGray,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
  },
});

export default SelectCityScreen;
