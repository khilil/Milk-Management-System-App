import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const boxSize = (width - 40) / 3; // Adjust for 3 columns with padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  locationsContainer: {
    marginTop: 10,
  },
  locationsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  touchableBox: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    maxWidth: boxSize, // Ensure uniform width
  },
  box: {
    width: boxSize,
    height: boxSize, // Fixed size for square boxes
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  icon: {
    marginBottom: 5,
  },
  boxText: {
    fontSize: 12, // Smaller font to fit text
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default styles;