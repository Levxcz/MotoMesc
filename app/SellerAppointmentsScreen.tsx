import React, { useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { sendNotification } from '../sendNotification'

interface Appointment {
  id: string;
  customerName: string;
  appointmentDate: string;
  description: string;
  image: string;
  plateNumber: string;
  createdAt: any; // Firestore timestamp
  status: string;
  uid: string; // Add customerId field to be used for notifications
  tracking: Array<{ step: string, timestamp: any }>;
}

const SellerAppointmentScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const fetchedAppointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(fetchedAppointments);
    };

    fetchAppointments();
  }, []);

  const confirmAppointment = async (id: string) => {
    const docRef = doc(db, "appointments", id);
    const selected = appointments.find(appt => appt.id === id);
    if (!selected) return;

    await updateDoc(docRef, {
      status: "confirmed",
      tracking: [...(selected.tracking || []), { step: "Confirmed by Seller", timestamp: new Date() }]
    });

    // Trigger notification to the customer
    await sendNotification(selected.uid, 'confirmed');

    setModalVisible(false);
    Alert.alert("Appointment Confirmed", "You have confirmed the appointment.");
  };

  const declineAppointment = async (id: string) => {
    const docRef = doc(db, "appointments", id);
    const selected = appointments.find(appt => appt.id === id);
    if (!selected) return;

    await updateDoc(docRef, {
      status: "declined",
      tracking: [...(selected.tracking || []), { step: "Declined by Seller", timestamp: new Date() }]
    });

    // Trigger notification to the customer
    await sendNotification(selected.uid, 'declined');

    setModalVisible(false);
    Alert.alert("Appointment Declined", "You have declined the appointment.");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Appointments</Text>
      {appointments.map(appt => (
        <TouchableOpacity 
          key={appt.id} 
          style={styles.appointmentCard} 
          onPress={() => {
            setSelectedAppointment(appt);
            setModalVisible(true);
          }}
        >
          <Image 
            source={{ uri: appt.image || 'https://via.placeholder.com/64' }} 
            style={styles.image} 
          />
          <Text><Text style={styles.boldText}>Customer:</Text> {appt.customerName}</Text>
          <Text><Text style={styles.boldText}>Status:</Text> {appt.status}</Text>
        </TouchableOpacity>
      ))}

      {selectedAppointment && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <Image 
                source={{ uri: selectedAppointment.image || 'https://via.placeholder.com/64' }} 
                style={styles.image} 
              />
              <Text><Text style={styles.boldText}>Customer:</Text> {selectedAppointment.customerName}</Text>
              <Text><Text style={styles.boldText}>Service:</Text> {selectedAppointment.description}</Text>
              <Text><Text style={styles.boldText}>Plate Number:</Text> {selectedAppointment.plateNumber}</Text>
              <Text><Text style={styles.boldText}>Booking Date:</Text> {selectedAppointment.appointmentDate}</Text>
              <Text>
                <Text style={styles.boldText}>Created At:</Text>{' '}
                {selectedAppointment.createdAt?.seconds ? new Date(selectedAppointment.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
              </Text>
              <Text><Text style={styles.boldText}>Status:</Text> {selectedAppointment.status}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  onPress={() => confirmAppointment(selectedAppointment.id)} 
                  style={[styles.button, styles.confirmButton]}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => declineAppointment(selectedAppointment.id)} 
                  style={[styles.button, styles.declineButton]}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>

              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  appointmentCard: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: 'black',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: 'green',
  },
  declineButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  }
});

export default SellerAppointmentScreen;
