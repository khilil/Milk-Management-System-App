// Enhanced Styles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const COLORS = {
  primary: '#2A5866',    // Deep teal for professional look
  secondary: '#6C9A8B',  // Muted green for calmness
  accent: '#FF6B6B',     // Coral for highlights
  background: '#F8F9FB', // Light background
  textDark: '#2C3E50',   // Dark text
  textLight: '#FFFFFF',   // White text
  status: '#FFD93D',     // Yellow for status indicators
};

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 20,
    shadowColor: '#E0E5EC',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  stats: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  profileButton: {
    padding: 10,
    backgroundColor: '#EFF2F7',
    borderColor: COLORS.primary,
    borderRadius: 50,
    borderWidth: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 15,
    marginBottom: 10,
  },
//   ____________________________________________________
// Center
//   ____________________________________________________
  touchableBox: {
    flex: 1,
    alignItems:'center',
    justifyContent:'center',
    margin: 5,

  },
  box: {
    width: (width - 60) / 3,
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    colors: [`${COLORS.primary}CC`, `${COLORS.secondary}CC`],
  },
  boxText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 5,
  },
  icon: {
    marginBottom: 5,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '45deg' }],
    width: '200%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E5EC',
  },
  footerButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 5,
  },
  footerText: {
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: 14,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(135deg, #FFFFFF 25%, transparent 25%)',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A5866',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  // coustomer add 
  listContainer: {
    padding: 20,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A5866',
  },
  customerEmail: {
    fontSize: 14,
    color: '#7F8FA4',
    marginTop: 5,
  },
  customerPhone: {
    fontSize: 14,
    color: '#7F8FA4',
    marginTop: 5,
  },
});
