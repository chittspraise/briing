import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

const PayoutsHistoryScreen: React.FC = () => {
  const handleSorting = () => {
    Alert.alert('Sorting', 'Open sorting options.');
  };

  const handleFilters = () => {
    Alert.alert('Filters', 'Open filter options.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => Alert.alert('Back', 'Go back to previous screen')}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payouts history</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Sorting and Filters */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={handleSorting}>
            <Text style={styles.controlButtonText}>Sorting {'\u25BE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleFilters}>
            <Text style={styles.controlButtonText}>Filters {'\u25BE'}</Text>
          </TouchableOpacity>
        </View>

        {/* Placeholder if no payouts */}
        <View style={styles.noPayoutsContainer}>
          <Text style={styles.noPayoutsText}>
            You don&#39;t have any payouts yet. Your payouts
          </Text>
          <Text style={styles.noPayoutsText}>
            will be shown here once you complete a delivery.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  controlButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  noPayoutsContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  noPayoutsText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PayoutsHistoryScreen;
