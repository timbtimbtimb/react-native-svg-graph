import { StyleSheet, View } from 'react-native';
import Temperatures from './Temperatures';
import SnowDepth from './SnowDepth';

export default function App() {
  return (
    <View style={styles.container}>
      <Temperatures name={'74056006'} />
      <SnowDepth name={'74056006'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgb(20,20,20)',
    gap: 20,
    padding: 20,
    overflow: 'scroll',
  },
  svg: {
    borderWidth: 1,
    borderColor: 'black',
  },
});
