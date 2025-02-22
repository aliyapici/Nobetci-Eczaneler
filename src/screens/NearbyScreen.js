// screens/NearbyScreen.js

import React, { useEffect, useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { fetchPharmacies } from "../services/api";
import { Button, Icon } from "react-native-elements";
import { LocationContext } from "../contexts/LocationContext";
import { COLORS } from "../constants/colors";

const NearbyScreen = ({ navigation }) => {
  const {
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    loading: citiesLoading,
  } = useContext(LocationContext);

  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPharmacies = async () => {
    if (!selectedCity) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Lokasyon izinlerini talep et
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "İzin Reddedildi",
          "Lokasyon izinleri reddedildi. Lokasyon bilgisi olmadan eczaneleri görüntüleyebilirsiniz."
        );
        setLoading(false);
        return;
      }

      // Kullanıcının mevcut lokasyonunu al
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // Seçilen il ve ilçe bazında tüm eczaneleri al
      const data = await fetchPharmacies(selectedCity.il, selectedDistrict);
      setPharmacies(data);
    } catch (error) {
      Alert.alert("Hata", "Yakındaki eczaneler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPharmacies();
  }, [selectedCity, selectedDistrict]);

  const handleRefresh = () => {
    getPharmacies();
  };

  const handleCityChange = () => {
    navigation.navigate("SelectCity");
  };

  if (citiesLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!selectedCity) {
    return (
      <View style={styles.centered}>
        <Icon
          name="map-marker"
          type="font-awesome"
          color={COLORS.primary}
          size={60}
        />
        <Text style={styles.noCityText}>
          Nöbetçi eczaneleri görmek için bir il ve ilçe seçin.
        </Text>
        <Button
          title="İl veya ilçe seç"
          onPress={handleCityChange}
          buttonStyle={styles.selectCityButton}
          icon={
            <Icon
              name="chevron-right"
              type="font-awesome"
              color={COLORS.white}
              style={{ marginRight: 15 }}
            />
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location
            ? location.latitude
            : pharmacies[0]?.maps.latitude || 39.888857,
          longitude: location
            ? location.longitude
            : pharmacies[0]?.maps.longitude || 32.818528,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        showsUserLocation={true}>
        {pharmacies.map((pharmacy, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(pharmacy.maps.latitude) || 39.888857,
              longitude: parseFloat(pharmacy.maps.longitude) || 32.818528,
            }}
            title={pharmacy.pharmacy_name}
            description={pharmacy.address}
            pinColor={COLORS.primary} // Ana renk
            onCalloutPress={() => {
              navigation.navigate("PharmacyDetails", { pharmacy });
            }}
          />
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.cityChangeButton}
        onPress={handleCityChange}>
        <Icon
          name="map-marker"
          type="font-awesome"
          color={COLORS.white}
          size={20}
        />
        <Text style={styles.cityChangeText}>Konumu Değiştir</Text>
      </TouchableOpacity>

      {/* Seçilen Konum Bilgisi */}
      <View style={styles.selectedLocationContainer}>
        <Text style={styles.selectedLocationText}>
          Seçilen konum:{" "}
          {selectedCity
            ? selectedCity.il +
              (selectedDistrict ? " / " + selectedDistrict : "")
            : "Belirtilmedi"}
        </Text>
      </View>

      {pharmacies.length === 0 && (
        <View style={styles.noPharmaciesContainer}>
          {/* Üst kısım: İkon ve mesaj */}
          <View style={styles.noPharmaciesMessage}>
            <Icon
              name="exclamation-circle"
              type="font-awesome"
              color="#fff"
              size={28}
            />
            <Text style={styles.noPharmaciesText}>
              {selectedCity
                ? `${selectedCity.il}${
                    selectedDistrict ? " / " + selectedDistrict : ""
                  } için nöbetçi eczane bulunamadı.`
                : "Nöbetçi eczane bulunamadı."}
            </Text>
          </View>

          {/* Alt kısım: İl genelinde arama yap butonu */}
          {selectedDistrict && (
            <TouchableOpacity
              style={styles.showAllButton}
              onPress={() => setSelectedDistrict(null)}>
              <Text style={styles.showAllButtonText}>
                {`${selectedCity.il} içindeki tüm nöbetçi eczaneleri göster`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
  },
  noCityText: {
    marginTop: 20,
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  selectCityButton: {
    backgroundColor: COLORS.primary,
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cityChangeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cityChangeText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  noPharmaciesContainer: {
    position: "absolute",
    bottom: 30,
    left: "10%",
    right: "10%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(167, 0, 0, 0.95)", // Daha koyu, şık kırmızı
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Android için gölge efekti
  },
  noPharmaciesMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  noPharmaciesText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
    lineHeight: 22,
  },
  showAllButton: {
    backgroundColor: "#fff", // Beyaz buton ile kontrast sağladık
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  showAllButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  selectedLocationContainer: {
    position: "absolute",
    top: 110, // Butonun altında
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  selectedLocationText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default NearbyScreen;
