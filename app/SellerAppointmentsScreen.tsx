import React, { useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';

interface Appointment {
  id: string;
  customerName: string;
  description: string;
  image: string;
  plateNumber: string;
  createdAt: any; // Firestore timestamp
  status: string;
  tracking: Array<{ step: string, timestamp: any }>;
}

const SellerAppointmentScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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
    const selectedAppointment = appointments.find(appt => appt.id === id);
    if (!selectedAppointment) return;

    await updateDoc(docRef, {
      status: "confirmed",
      tracking: [
        ...selectedAppointment.tracking || [],
        { step: "Confirmed by Seller", timestamp: new Date() }
      ]
    });
  };

  const declineAppointment = async (id: string) => {
    const docRef = doc(db, "appointments", id);
    const selectedAppointment = appointments.find(appt => appt.id === id);
    if (!selectedAppointment) return;

    await updateDoc(docRef, {
      status: "declined",
      tracking: [
        ...selectedAppointment.tracking || [],
        { step: "Declined by Seller", timestamp: new Date() }
      ]
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Appointments</Text>
      {appointments.map(appt => (
        <View key={appt.id} style={styles.appointmentCard}>
          <Image 
            source={{ uri: appt.image || 'https://via.placeholder.com/64' }} 
            style={styles.image} 
          />
          <Text><Text style={styles.boldText}>Customer:</Text> {appt.customerName}</Text>
          <Text><Text style={styles.boldText}>Service:</Text> {appt.description}</Text>
          <Text><Text style={styles.boldText}>Plate Number:</Text> {appt.plateNumber}</Text>
          <Text>
            <Text style={styles.boldText}>Created At:</Text>{' '}
            {appt.createdAt && new Date(appt.createdAt.seconds * 1000).toLocaleString()}
          </Text>
          <Text><Text style={styles.boldText}>Status:</Text> {appt.status}</Text>

          {appt.status === 'pending' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={() => confirmAppointment(appt.id)} 
                style={[styles.button, styles.confirmButton]}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => declineAppointment(appt.id)} 
                style={[styles.button, styles.declineButton]}
              >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
});

export default SellerAppointmentScreen;
