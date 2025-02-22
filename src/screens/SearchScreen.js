// screens/SearchScreen.js

import React, { useEffect, useState, useContext } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { SearchBar, Icon, Button } from "react-native-elements";
import { Text } from "react-native"; // Text'i doğrudan react-native'den import ediyoruz
import * as Location from "expo-location"; // expo-location import
import { fetchPharmacies } from "../services/api";
import PharmacyItem from "../components/PharmacyItem";
import { LocationContext } from "../contexts/LocationContext";
import { COLORS } from "../constants/colors";

const SearchScreen = ({ navigation }) => {
  // Konum ve il/ilçe bilgileri için Context’i çekiyoruz
  const {
    cities,
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    loading: citiesLoading,
  } = useContext(LocationContext);

  // Eczane listesi
  const [pharmacies, setPharmacies] = useState([]);
  // Filtrelenmiş eczane listesi
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  // Sayfada bekleme durumu
  const [loading, setLoading] = useState(true);
  // Arama metni
  const [search, setSearch] = useState("");
  // Listeyi yenileme durumu
  const [refreshing, setRefreshing] = useState(false);

  // ----------------------------------------------------------------
  // 1) İller yüklendikten sonra, konum iznini alıp konumdan il/ilçe bulalım
  // ----------------------------------------------------------------
  useEffect(() => {
    const getCurrentLocationAndSetCity = async () => {
      // 1. citiesLoading bitmeden kullanıcı konum isteği göndermesin
      if (citiesLoading || cities.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Konum iznini talep edelim
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // Kullanıcı izni reddederse, elle il seçmesi için ekranı boş bırakalım
          setLoading(false);
          return;
        }

        // Mevcut konumu al
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Ters coğrafi kodlama ile il ve ilçe bulma
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode.length > 0) {
          const { region, subregion } = geocode[0];

          if (!region) {
            throw new Error("İl bilgisi bulunamadı.");
          }

          // İl dizinizde bu region var mı kontrol edelim
          const foundCity = cities.find(
            (c) => c.il.toLowerCase() === region.toLowerCase()
          );

          if (foundCity) {
            // İlçeyi de bulabilirsek set edelim
            if (subregion) {
              const foundDistrict = foundCity.ilceleri.find(
                (d) => d.toLowerCase() === subregion.toLowerCase()
              );
              setSelectedCity(foundCity);
              setSelectedDistrict(foundDistrict || null);
            } else {
              // Sadece il set edelim
              setSelectedCity(foundCity);
              setSelectedDistrict(null);
            }
          } else {
            // Ters geocoding ile gelen il, cities array'inde yoksa
            // elle seçilmesi için bekleme ekranı
            console.log("Ters geocoding sonucu il, listede yok:", region);
          }
        } else {
          throw new Error("Ters geocoding sonucu boş döndü.");
        }
      } catch (error) {
        console.log("Konum alınırken hata:", error);
        // Hata durumunda kullanıcı yine elle seçim yapacak
      } finally {
        // İşlemler tamamlandığında loading'i kapatıyoruz
        setLoading(false);
      }
    };

    getCurrentLocationAndSetCity();
    // Bu effect, “citiesLoading” false olduğunda veya “cities” güncellendiğinde tetiklenir
  }, [citiesLoading, cities]);

  // ----------------------------------------------------------------
  // 2) İl ve ilçe bilgisi alındıktan (veya elle seçildikten) sonra eczaneleri çekelim
  // ----------------------------------------------------------------
  const getPharmacies = async () => {
    if (!selectedCity) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const data = await fetchPharmacies(selectedCity.il, selectedDistrict);
      setPharmacies(data);
      setFilteredPharmacies(data);
    } catch (error) {
      Alert.alert("Hata", "Eczaneler yüklenemedi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getPharmacies();
  }, [selectedCity, selectedDistrict]);

  // ----------------------------------------------------------------
  // 3) Arama Metnini Ele Alma
  // ----------------------------------------------------------------
  const handleSearch = (text) => {
    setSearch(text);
    if (text === "") {
      setFilteredPharmacies(pharmacies);
    } else {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.pharmacy_name.toLowerCase().includes(text.toLowerCase()) ||
          pharmacy.address.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    }
  };

  // Listeyi yenilemek için
  const handleRefresh = () => {
    setRefreshing(true);
    getPharmacies();
  };

  // İl seçme ekranına git
  const handleCitySelection = () => {
    navigation.navigate("SelectCity");
  };

  // ----------------------------------------------------------------
  // Ekranların Render Edilmesi
  // ----------------------------------------------------------------

  // 1. Eğer il listesi hâlâ yükleniyorsa
  if (citiesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 2. Eğer konum veya ters geocoding sürecinde loading true ise
  //    ve henüz selectedCity set edilmemişse
  if (loading && !selectedCity) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.promptText}>
          Konum bilgisi yükleniyor, lütfen bekleyin...
        </Text>
      </View>
    );
  }

  // 3. Kullanıcı konum iznini reddetti veya ters geocoding başarısız oldu
  //    -> Elle il seçmesi için eski akış
  if (!selectedCity) {
    return (
      <View style={styles.centered}>
        <Icon
          name="city"
          type="material-community"
          color={COLORS.primary}
          size={60}
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.promptText}>
          Nöbetçi eczaneleri görmek için bir il ve ilçe seçin.
        </Text>
        <Button
          title="İl veya ilçe seç"
          onPress={handleCitySelection}
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

  // 4. İl seçili ise (konumdan ya da elle)
  return (
    <View style={styles.container}>
      {/* Üstte seçili il/ilçe gösterimi */}
      <TouchableOpacity
        style={styles.citySelector}
        onPress={handleCitySelection}>
        <Icon
          name="city"
          type="material-community"
          color={COLORS.primary}
          size={24}
        />
        <Text style={styles.citySelectorText}>
          {selectedCity
            ? selectedDistrict
              ? `${selectedCity.il} / ${selectedDistrict}`
              : selectedCity.il
            : "İl ve İlçe Seç"}
        </Text>
        <Icon
          name="chevron-right"
          type="material-community"
          color={COLORS.primary}
          size={24}
        />
      </TouchableOpacity>

      {/* Arama Barı */}
      <SearchBar
        placeholder="Eczane ara..."
        onChangeText={handleSearch}
        value={search}
        lightTheme
        round
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
        inputStyle={styles.searchInput}
        onSubmitEditing={Keyboard.dismiss}
        clearIcon={{ color: COLORS.primary }}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : pharmacies.length === 0 ? (
        <View style={styles.noPharmaciesWrapper}>
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
        </View>
      ) : (
        // Eczaneleri Listele
        <FlatList
          data={filteredPharmacies}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <PharmacyItem pharmacy={item} />}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

// ----------------------------------------------------------------------------
// Stil tanımları
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  citySelectorText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 10,
    flex: 1,
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
  list: {
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    backgroundColor: COLORS.lightGray,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.gray,
    textAlign: "center",
  },
  promptText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 20,
  },
  selectCityButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  noPharmaciesWrapper: {
    flex: 1, // Sayfanın tamamını kaplasın
    justifyContent: "center", // Dikeyde ortalıyor
    alignItems: "center", // Yatayda ortalıyor
    paddingHorizontal: 20,
  },

  noPharmaciesContainer: {
    backgroundColor: COLORS.primary, // Arka plan rengi artık uygulanacak
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    maxWidth: "90%", // Taşmayı önlemek için
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
    width: "90%", // Butonun genişliği ayarlandı
    alignItems: "center",
  },

  showAllButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
});

export default SearchScreen;
