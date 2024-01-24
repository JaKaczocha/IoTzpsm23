import React, { Component } from 'react';
import { View, Text, FlatList, Button, TextInput, ScrollView } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
//import BleManager from 'react-native-ble-manager';

class ConnectionScreen extends Component {
  constructor(props) {
    super(props);

    this.manager = new BleManager();

    this.state = {
      uniqueDevices: {},
      devices: [],
      commandInput: '',
      logs: [],
    };
  }

  addLog = (log) => {
    this.setState((prevState) => ({ logs: [...prevState.logs, log] }));
  };
  clearLogs = () => {
    this.setState({ logs: [] });
  };



  showAllDevices = () => {
    this.addLog('Wszystkie unikalne urządzenia:');
    Object.values(this.state.uniqueDevices).forEach((device) => {
      this.addLog(`Nazwa: ${device.name}, Adres: ${device.id}`);
    });
  };
  scanForArduino = async () => {
    try {
      // Rozpocznij skanowanie urządzeń Bluetooth
      this.addLog('Rozpoczęto skanowanie urządzeń Bluetooth.');

      this.manager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          this.addLog(`Błąd podczas skanowania: ${error}`);
          return;
        }

        const deviceId = device.id;

        if (!this.state.uniqueDevices[deviceId]) {
          // Jeśli urządzenie jeszcze nie zostało dodane, dodaj je do obiektu uniqueDevices
          const newDevice = {
            name: device.name,
            id: deviceId,
          };

          this.setState((prevState) => ({
            uniqueDevices: {
              ...prevState.uniqueDevices,
              [deviceId]: newDevice,
            },
          }));

          this.addLog(`Znalezione urządzenie: ${device.name} (${deviceId})`);

          if (device.name === 'GR_2') {
            // Zakończ skanowanie po znalezieniu urządzenia
            this.manager.stopDeviceScan();
            this.addLog('Zakończono skanowanie po znalezieniu urządzenia.');

            // Nawiąż połączenie z urządzeniem
            const connectedDevice = await device.connect();
            this.addLog('Nawiązano połączenie z urządzeniem.');

            // Odkryj wszystkie usługi i charakterystyki urządzenia
            const allServicesAndChars = await connectedDevice.discoverAllServicesAndCharacteristics();

            // Pobierz szczegółowe informacje o urządzeniu
            const deviceInfo = {
              id: deviceId,
              serviceUUID: 'FFE0', // Zastąp odpowiednim UUID
              characteristicUUID: 'FFE1', // Zastąp odpowiednim UUID
            };

            // Zapisz informacje o urządzeniu za pomocą AsyncStorage
            await AsyncStorage.setItem('device', JSON.stringify(deviceInfo));
            this.addLog('Zapisano informacje o urządzeniu w AsyncStorage.');

            // Przejdź do zakładki Devices (tu musisz napisać kod nawigacji)
            this.readDataFromDevice(); // Dodaj to wywołanie
          }
        }
      });
    } catch (error) {
      this.addLog(`Błąd ogólny: ${error}`);
    }
  };

  sendCommandToDevice = async (command) => { 
    try {
      // Pobierz informacje o urządzeniu z AsyncStorage
      const deviceInfo = await AsyncStorage.getItem('device');
      if (!deviceInfo) {
        this.addLog('Brak informacji o urządzeniu w AsyncStorage.');
        return;
      }
      if(command != 'red' && command != 'blue' && command != 'green') {
        this.addLog('invalid command try: red,blue or green');
        return;
      }
      const parsedDeviceInfo = JSON.parse(deviceInfo);


     
      let encodedCommand = Buffer.from(command).toString('base64');

      // Wyślij komendę do urządzenia
      await this.manager.writeCharacteristicWithResponseForDevice(
        parsedDeviceInfo.id,
        parsedDeviceInfo.serviceUUID,
        parsedDeviceInfo.characteristicUUID,
        encodedCommand
      ).then(response => {
        this.addLog('Response', response);
      }).catch((error) => {
        console.log('error', error);
      }
      ) 

    

      this.addLog(`Wysłano komendę: ${command}`);
      console.log('Komenda wysłana pomyślnie.');
    } catch (error) {
      this.addLog(`Błąd podczas wysyłania komendy: ${error}`);
      console.error('Błąd podczas wysyłania komendy:', error);
    }
  };

  readDataFromDevice = async () => {
    try {
      // Pobierz informacje o urządzeniu z AsyncStorage
      const deviceInfo = await AsyncStorage.getItem('device');
      if (!deviceInfo) {
        this.addLog('Brak informacji o urządzeniu w AsyncStorage.');
        return;
      }
  
      const parsedDeviceInfo = JSON.parse(deviceInfo);
  
      // Monitoruj charakterystykę dla odczytu danych
      this.manager.monitorCharacteristicForDevice(
        parsedDeviceInfo.id,
        parsedDeviceInfo.serviceUUID,
        parsedDeviceInfo.characteristicUUID,
        async (error, response) => {
          if (error) {
            this.addLog(`Błąd podczas monitorowania charakterystyki: ${error}`);
            return;
          }
  
          const value = response && response.value ? Buffer.from(response.value, 'base64').toString() : null;
          this.addLog(`Odebrana i odkodowana wartość: ${value}`);
        }
      );
      this.addLog('Rozpoczęto monitorowanie charakterystyki dla odczytu danych.');
    } catch (error) {
      this.addLog(`Błąd podczas monitorowania charakterystyki: ${error}`);
    }
  };

  render() {
    return (
      <View>
        <Text>Dostępne urządzenia Bluetooth:</Text>
        <FlatList
          data={this.state.devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>Nazwa: {item.name}</Text>
              <Text>Adres: {item.id}</Text>
            </View>
          )}
        />
        <Button title="Skanuj i Połącz" onPress={this.scanForArduino} />
        <Button title="Zatrzymaj skanowanie" onPress={() => this.manager.stopDeviceScan()} />
        <Button title="Pokaż Wszystkie Urządzenia" onPress={this.showAllDevices} />
        {/* Pole do wyświetlania logów */}
        <ScrollView style={{  maxHeight: 250, minHeight: 200, borderWidth: 1, borderColor: 'gray', marginTop: 10 }}>
          {this.state.logs.map((log, index) => (
            <Text key={index}>{log}</Text>
          ))}
        </ScrollView>
        <Button title="Czyść Logi" onPress={this.clearLogs} />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 10 }}
          placeholder="Wprowadź komendę"
          onChangeText={(text) => this.setState({ commandInput: text })}
          value={this.state.commandInput}
        />
        <Button
          title="Wyślij Komendę"
          onPress={() => {
            this.sendCommandToDevice(this.state.commandInput);
          }}
        />
      </View>
    );
  }
}

export default ConnectionScreen;
