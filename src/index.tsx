import { StyleSheet, View } from 'react-native';
import Temperatures from './Temperatures';

export default function App() {
  return (
    <View style={styles.container}>
      <Temperatures />
      {/* <Wind /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(20,20,20)',
    gap: 20,
    padding: 20,
  },
  svg: {
    borderWidth: 1,
    borderColor: 'black',
  },
});
