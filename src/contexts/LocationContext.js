// contexts/LocationContext.js

import React, { createContext, useState, useEffect } from "react";
import { fetchCitiesAndDistricts } from "../services/api";
import { Alert } from "react-native";
import * as Location from "expo-location";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await fetchCitiesAndDistricts();
        setCities(data);
      } catch (error) {
        Alert.alert("Hata", "İller yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // Eğer konum tabanlı il seçimini burada yapmak isterseniz, aşağıdaki fonksiyonu kullanabilirsiniz:
  const setCityByLocation = async () => {
    setLocationLoading(true);
    try {
      // Lokasyon izinlerini talep et
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "İzin Reddedildi",
          "Konum izni reddedildi. Yakındaki eczaneleri görmek için manuel olarak il veya ilçe seçebilirsiniz."
        );
        setLocationLoading(false);
        return;
      }

      // Kullanıcının mevcut lokasyonunu al
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Reverse Geocoding ile il ve ilçe bul
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        let { city, subregion } = reverseGeocode[0];

        // İl ve ilçe adlarını API verileriyle eşleştir
        const matchedCity = cities.find(
          (c) => c.il.toLowerCase() === city.toLowerCase()
        );

        if (matchedCity) {
          const matchedDistrict = matchedCity.ilceleri.find(
            (d) => d.toLowerCase() === subregion?.toLowerCase()
          );

          setSelectedCity(matchedCity);
          setSelectedDistrict(matchedDistrict || null);
        } else {
          Alert.alert(
            "Konum Belirlenemedi",
            "Bulunan il veritabanımızda bulunamadı. Lütfen manuel olarak il seçin."
          );
        }
      } else {
        Alert.alert(
          "Konum Bulunamadı",
          "Konumunuz bulunamadı. Lütfen manuel olarak il seçin."
        );
      }
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert(
        "Hata",
        "Konumunuz alınırken bir hata oluştu. Lütfen manuel olarak il seçin."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        cities,
        selectedCity,
        setSelectedCity,
        selectedDistrict,
        setSelectedDistrict,
        loading,
        locationLoading,
        setCityByLocation, // Ek olarak fonksiyon ekledik
      }}>
      {children}
    </LocationContext.Provider>
  );
};
