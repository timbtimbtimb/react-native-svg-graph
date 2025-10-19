import { StyleSheet, Text, View } from 'react-native';
import Graph from '../../src/index';
import useSourceData from './useSourceData';

export default function App() {
  const { temperatures, wind, snowDepth, station, sun } = useSourceData();

  const width = 1500;
  const height = 250;

  return (
    <View style={styles.container}>
      {station && (
        <View>
          <Text style={styles.title}>
            {`${station?.properties.name} (${station?.properties.elevation} m) - [${station?.properties.id}]`}
          </Text>
          <Text style={styles.subtitle}>{station?.properties.region}</Text>
          {sun && (
            <>
              <Text style={styles.subtitle}>
                {`Aube: ${sun?.sunrise.getHours()}h${sun?.sunrise.getMinutes().toString().padStart(2, '0')}`}
                {` - `}
                {`Crépuscule: ${sun?.sunset.getHours()}h${sun?.sunrise.getMinutes().toString().padStart(2, '0')}`}
              </Text>
            </>
          )}
        </View>
      )}
      <View>
        <Graph
          values={temperatures}
          width={width}
          height={height}
          zeroVisible={true}
          fontSize={15}
          formatter={(v: number) => `${v}°`}
          colors={[
            {
              positiveColor: 'rgba(255, 123, 0, 1)',
              negativeColor: 'rgba(0, 102, 255, 1)',
            },
          ]}
        />
        <Text style={styles.graphTitle}>Températures (°C)</Text>
      </View>
      <View>
        <Graph
          values={wind}
          width={width}
          height={height}
          zeroVisible={true}
          fontSize={15}
          formatter={(v: number) => `${v} km/h`}
          colors={[
            {
              positiveColor: 'rgba(200, 200, 200, 1)',
              negativeColor: 'rgba(200, 200, 200, 1)',
            },
            {
              positiveColor: 'rgba(200, 200, 200, 0.33)',
              negativeColor: 'rgba(200, 200, 200, 0.33)',
            },
          ]}
        />
        <Text style={styles.graphTitle}>Vent et rafales (km/h)</Text>
      </View>
      <View>
        <Graph
          values={snowDepth}
          width={width}
          height={height}
          zeroVisible={true}
          fontSize={15}
          formatter={(v: number) => `${v} cm`}
          colors={[
            {
              positiveColor: 'rgba(0, 102, 255, 1)',
              negativeColor: 'rgba(0, 102, 255, 1)',
            },
          ]}
        />
        <Text style={styles.graphTitle}>Neige (cm)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(20,20,20)',
    overflow: 'scroll',
    width: '100%',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 50,
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 30,
  },
  graphTitle: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
