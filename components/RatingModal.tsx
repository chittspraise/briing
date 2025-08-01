
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

const RatingModal = ({ visible, onClose, onSubmit }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = () => {
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Rate your experience</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#FFD700' : '#C0C0C0'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#888"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#fff',
    borderWidth: 1,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    width: 250,
    height: 100,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#fff',
    backgroundColor: '#222',
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '80%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#aaa',
  },
});

export default RatingModal;
