import { StyleSheet, View } from 'react-native';
import Temperatures from './Temperatures';
// import SnowDepth from './SnowDepth';
import Wind from './Wind';

export default function App() {
  return (
    <View style={styles.container}>
      <Wind name={'65059001'} />
      <Temperatures name={'65059001'} />
      {/* <SnowDepth name={'65059001'} /> */}
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
