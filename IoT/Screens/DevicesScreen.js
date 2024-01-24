import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function DevicesScreen({ navigation }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [command, setCommand] = useState('');
  const [devices, setDevices] = useState([]);
  const [editingDeviceId, setEditingDeviceId] = useState(null);

  // Pobierz urządzenia z AsyncStorage po otwarciu ekranu
  useEffect(() => {
    getDevicesFromStorage();
  }, []);

  // Pobierz urządzenia z AsyncStorage
  const getDevicesFromStorage = async () => {
    try {
      const storedDevices = await AsyncStorage.getItem('devices');
      if (storedDevices !== null) {
        setDevices(JSON.parse(storedDevices));
      }
    } catch (error) {
      console.error('Error reading devices from AsyncStorage:', error);
    }
  };

  // Zapisz urządzenia do AsyncStorage
  const saveDevicesToStorage = async (updatedDevices) => {
    try {
      await AsyncStorage.setItem('devices', JSON.stringify(updatedDevices));
    } catch (error) {
      console.error('Error saving devices to AsyncStorage:', error);
    }
  };

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    // Zresetuj stan edytowanego urządzenia po zamknięciu modala
    setEditingDeviceId(null);
    setDeviceName('');
    setRoomName('');
    setCommand('');
  };

  const handleAddDevice = () => {
    const newDevice = {
      id: devices.length + 1, // przyjmujemy, że id to kolejne liczby całkowite
      deviceName,
      roomName,
      command,
    };

    // Dodaj nowe urządzenie do listy
    const updatedDevices = [...devices, newDevice];
    setDevices(updatedDevices);

    // Zapisz urządzenia do AsyncStorage
    saveDevicesToStorage(updatedDevices);

    // Po zakończeniu dodawania urządzenia zamykamy modal
    closeModal();
  };

  const handleEditDevice = (id) => {
    const editedDevice = devices.find((device) => device.id === id);

    if(editedDevice) {
      // Otwórz modal do edycji z istniejącymi danymi
    setEditingDeviceId(id);
    setDeviceName(editedDevice.deviceName);
    setRoomName(editedDevice.roomName);
    setCommand(editedDevice.command);

    // Usuń edytowane urządzenie z listy
    const updatedDevices = devices.filter((device) => device.id !== id);
    setDevices(updatedDevices);

    // Otwórz modal do edycji
    openModal();
    }
    // Otwórz modal do edycji z istniejącymi danymi
    setEditingDeviceId(id);
    setDeviceName(editedDevice.deviceName);
    setRoomName(editedDevice.roomName);
    setCommand(editedDevice.command);

    // Usuń edytowane urządzenie z listy
    const updatedDevices = devices.filter((device) => device.id !== id);
    setDevices(updatedDevices);

    // Otwórz modal do edycji
    openModal();
  };

  // Funkcja do usunięcia urządzenia
  const deleteDevice = (id) => {
    // Usuń urządzenie z listy
    const updatedDevices = devices.filter((device) => device.id !== id);
    setDevices(updatedDevices);

    // Zapisz zaktualizowane urządzenia do AsyncStorage
    saveDevicesToStorage(updatedDevices);

    // Zamknij modal
    closeModal();
  };

  return (
    <View style={styles.container}>
      {/* Wyświetl kafelki z nazwami urządzeń i nazwami pomieszczeń */}
      {devices.map((device) => (
        <TouchableOpacity
          key={device.id}
          style={styles.deviceTile}
          onPress={() => handleEditDevice(device.id)}
        >
          <Text style={styles.deviceName}>{device.deviceName}</Text>
          <Text style={styles.roomName}>{device.roomName}</Text>
        </TouchableOpacity>
      ))}

<Modal visible={isModalVisible} animationType="slide">
  <View style={styles.modalContainer}>
    <Text>{editingDeviceId ? 'Edit Device' : 'Add New Device'}</Text>

    {/* Formularz */}
    <TextInput
      style={styles.input}
      placeholder="Device Name"
      value={deviceName ?? ''}
      onChangeText={(text) => setDeviceName(text)}
    />
    <TextInput
      style={styles.input}
      placeholder="Room Name"
      value={roomName}
      onChangeText={(text) => setRoomName(text)}
    />
    <TextInput
      style={styles.input}
      placeholder="Command"
      value={command}
      onChangeText={(text) => setCommand(text)}
    />

    {/* Przycisk do dodawania/edycji urządzenia */}
    <Button
      title={editingDeviceId ? 'Save' : 'Add'}
      onPress={editingDeviceId ? handleAddDevice : handleAddDevice}
    />

    {/* Przycisk do usuwania urządzenia (jeśli edytowane) */}
    {editingDeviceId && (
      <Button title="Delete" color="red" onPress={() => deleteDevice(editingDeviceId)} />
    )}

   
  </View>
</Modal>

      {/* Przycisk "+" w stylu kafelka */}
      <TouchableOpacity style={styles.addStyle} onPress={openModal}>
        <Text style={styles.deviceName}>+</Text>
      </TouchableOpacity>
    </View>
  );
}


// Stylizacja
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Ustawianie kierunku na poziomy (domyślnie jest pionowy)
    justifyContent: 'space-between', // Rozłożenie przestrzeni między kafelkami
    alignItems: 'center',
    flexWrap: 'wrap', // Ta linia pozwoli na zawijanie elementów na nowy wiersz
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5,
    width: 200,
  },
  deviceTile: {
    backgroundColor: '#e0e0e0',
    padding: 2,
    margin: 1,
    borderRadius: 5,
    width: '48%', // Szerokość na połowę ekranu
  },
  deviceName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  addStyle: {
    backgroundColor: '#e0e0e0',
    padding: 2,
    paddingVertical:11,
    margin: 4,
    borderRadius: 5,
    width: '48%', // Szerokość na połowę ekranu
  },
  roomName: {
    fontSize: 14,
    color: 'gray',textAlign: 'center',
  },
});

export default DevicesScreen;
