// components/PharmacyItem.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from "react-native";
import { Card, Button, Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import { COLORS } from "../constants/colors";

const PharmacyItem = ({ pharmacy }) => {
  const navigation = useNavigation();

  const {
    pharmacy_name,
    address,
    address_description,
    region,
    duty_status,
    phone,
    maps: { google, apple, yandex },
  } = pharmacy;

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleOpenMap = (mapType) => {
    let url = "";
    if (mapType === "google") {
      url = google;
    } else if (mapType === "apple") {
      url = apple;
    } else if (mapType === "yandex") {
      url = yandex;
    }

    if (url) {
      Linking.openURL(url).catch((err) => {
        Alert.alert("Hata", `${mapType} haritaları açılamadı.`);
        console.error(`Failed to open ${mapType} maps:`, err);
      });
    } else {
      Alert.alert("Hata", `${mapType} harita bağlantısı mevcut değil.`);
    }
    toggleModal();
  };

  const handleCall = () => {
    const phoneNumber = `tel:${phone.replace(/\s+/g, "")}`;
    Linking.openURL(phoneNumber).catch((err) => {
      Alert.alert("Hata", "Arama yapılamadı.");
      console.error("Failed to make a call:", err);
    });
  };

  const handleDetails = () => {
    navigation.navigate("PharmacyDetails", { pharmacy });
  };

  return (
    <Card containerStyle={styles.card}>
      <TouchableOpacity onPress={handleDetails} activeOpacity={0.8}>
        <View style={styles.header}>
          {/* Logo Ekleme */}
          {/* <Icon
            name="hospital-o"
            type="font-awesome"
            color={COLORS.primary}
            size={24}
            style={styles.logo}
          /> */}
          <Image
            source={require("../assets/heart.png")}
            style={[styles.logo, { height: 24, width: 24 }]} // Ekledik
            resizeMode="contain"
          />
          <Text style={styles.name}>{pharmacy_name}</Text>
        </View>
        {/* Adres */}
        <View style={styles.infoSection}>
          <Icon
            name="map-marker"
            type="font-awesome"
            color={COLORS.primary}
            size={16}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{address}</Text>
        </View>
        {/* Adres Tarifi */}
        {/* {address_description ? (
          <View style={styles.infoSection}>
            <Icon
              name="map-signs"
              type="font-awesome"
              color={COLORS.primary}
              size={16}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{address_description}</Text>
          </View>
        ) : null} */}
        {/* İlçe */}
        <View style={styles.infoSection}>
          <Icon
            name="building"
            type="font-awesome"
            color={COLORS.primary}
            size={16}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{region}</Text>
        </View>
        {/* Telefon */}
        <View style={styles.infoSection}>
          <Icon
            name="phone"
            type="font-awesome"
            color={COLORS.primary}
            size={16}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{phone}</Text>
        </View>
      </TouchableOpacity>
      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <Button
          title="Yol Tarifi"
          type="outline"
          onPress={toggleModal}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          icon={
            <Icon
              name="directions"
              type="material"
              color={COLORS.primary}
              size={20}
            />
          }
        />
        <Button
          title="Ara"
          type="outline"
          onPress={handleCall}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          icon={
            <Icon
              name="phone"
              type="font-awesome"
              color={COLORS.primary}
              size={20}
            />
          }
        />
      </View>

      {/* Harita Seçim Modali */}
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Harita Sağlayıcısını Seç</Text>
          <Button
            title="Google Haritalar"
            type="outline"
            onPress={() => handleOpenMap("google")}
            buttonStyle={styles.modalButton}
            // icon={<Icon name="google" type="font-awesome" color="#DB4437" />}
            titleStyle={styles.modalButtonTitle}
          />
          <Button
            title="Apple Haritalar"
            type="outline"
            onPress={() => handleOpenMap("apple")}
            buttonStyle={styles.modalButton}
            // icon={<Icon name="apple" type="font-awesome" color="#000" />}
            titleStyle={styles.modalButtonTitle}
          />
          <Button
            title="Yandex Haritalar"
            type="outline"
            onPress={() => handleOpenMap("yandex")}
            buttonStyle={styles.modalButton}
            // icon={
            //   <Icon name="yandex" type="font-awesome" color={COLORS.primary} />
            // }
            titleStyle={styles.modalButtonTitle}
          />
          <Button
            title="İptal"
            type="clear"
            onPress={toggleModal}
            titleStyle={styles.cancelButtonTitle}
          />
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    flex: 1,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    flexShrink: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 0.48,
  },
  buttonTitle: {
    color: COLORS.primary,
    fontSize: 14,
    marginLeft: 5,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 22,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: COLORS.primary,
  },
  modalButton: {
    borderColor: COLORS.primary,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  modalButtonTitle: {
    color: COLORS.primary,
    marginLeft: 10,
  },
  cancelButtonTitle: {
    color: COLORS.primary,
    marginTop: 10,
    textAlign: "center",
  },
});

export default PharmacyItem;
