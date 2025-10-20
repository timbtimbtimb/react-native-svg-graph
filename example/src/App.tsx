import { StyleSheet, Text, View } from 'react-native';
import Graph from '../../src/index';
import useSourceData from './useSourceData';
import XAxis from '../../src/components/XAxis';
import YAxis from '../../src/components/YAxis';
import Grid from '../../src/components/Grid';
import Lines from '../../src/components/Lines';
import Pointer from '../../src/components/Pointer';

export default function App() {
  const { temperatures, wind, snowDepth, station, sun, distance, time } =
    useSourceData();

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
          values={[distance]}
          width={width}
          height={height}
          zeroVisible={false}
          fontSize={15}
          formatter={(v: number) => `${v} m`}
        >
          <XAxis />
          <YAxis />
          <Grid
            axis={'y'}
            position={'top'}
            type={'value'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => `${v} m`}
          />
          <Grid
            axis={'x'}
            type={'value'}
            position={'bottom'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => `${v} km`}
          />
          <Lines
            colors={[
              {
                positiveColor: 'rgba(200, 200, 200, 1)',
                negativeColor: 'rgba(200, 200, 200, 1)',
              },
            ]}
          />
          <Pointer />
        </Graph>
        <Text style={styles.graphTitle}>Altitude (m) / Distance (km)</Text>
      </View>
      <View>
        <Graph
          values={[time]}
          width={width}
          height={height}
          zeroVisible={false}
          fontSize={15}
          formatter={(v: number) => `${v}m`}
        >
          <XAxis />
          <YAxis />
          <Grid
            axis={'y'}
            position={'top'}
            type={'value'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => `${v} m`}
          />
          <Grid
            axis={'x'}
            position={'bottom'}
            type={'hours'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return `${date.getHours().toString()}h`;
            }}
          />
          <Lines
            colors={[
              {
                positiveColor: 'rgba(200, 200, 200, 1)',
                negativeColor: 'rgba(200, 200, 200, 1)',
              },
            ]}
          />
          <Pointer />
        </Graph>
        <Text style={styles.graphTitle}>Altitude (m) / Time (h)</Text>
      </View>
      <View>
        <Graph
          values={temperatures}
          width={width}
          height={height}
          zeroVisible={true}
          fontSize={15}
          formatter={(v: number) => `${v}°`}
        >
          <XAxis atZero />
          <YAxis />
          <Grid
            axis={'y'}
            position={'top'}
            type={'value'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => `${v}°`}
          />
          <Grid
            axis={'x'}
            position={'bottom'}
            type={'hours'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return `${date.getHours().toString().padStart(2, '0')}h`;
            }}
          />
          <Grid
            axis={'x'}
            position={'top'}
            type={'days'}
            strokeWidth={3}
            stroke={'rgb(100,100,100)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return [
                [
                  'dimanche',
                  'lundi',
                  'mardi',
                  'mercredi',
                  'jeudi',
                  'vendredi',
                  'samedi',
                ][date.getDay()],
                date.getDate().toString(),
              ].join(' ');
            }}
          />
          <Lines
            colors={[
              {
                positiveColor: 'rgba(255, 123, 0, 1)',
                negativeColor: 'rgba(0, 102, 255, 1)',
              },
            ]}
          />
          <Pointer />
        </Graph>
        <Text style={styles.graphTitle}>Temperatures (°C)</Text>
      </View>
      <View>
        <Graph
          values={wind}
          width={width}
          height={height}
          zeroVisible={true}
          fontSize={15}
          formatter={(v: number) => `${v} km/h`}
        >
          <XAxis />
          <YAxis />
          <Grid
            axis={'y'}
            position={'top'}
            type={'value'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => `${v} km/h`}
          />
          <Grid
            axis={'x'}
            position={'bottom'}
            type={'hours'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return `${date.getHours().toString().padStart(2, '0')}h`;
            }}
          />
          <Grid
            axis={'x'}
            position={'top'}
            type={'days'}
            strokeWidth={3}
            stroke={'rgb(100,100,100)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return [
                [
                  'dimanche',
                  'lundi',
                  'mardi',
                  'mercredi',
                  'jeudi',
                  'vendredi',
                  'samedi',
                ][date.getDay()],
                date.getDate().toString(),
              ].join(' ');
            }}
          />
          <Lines
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
          <Pointer />
        </Graph>
        <Text style={styles.graphTitle}>Wind (°C)</Text>
      </View>
      <View>
        <Graph
          values={snowDepth}
          width={width}
          height={height}
          zeroVisible={true}
          fontSize={15}
          formatter={(v: number) => `${v} cm`}
        >
          <XAxis />
          <YAxis />
          <Grid
            axis={'y'}
            position={'top'}
            type={'value'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => `${v} cm`}
          />
          <Grid
            axis={'x'}
            position={'bottom'}
            type={'hours'}
            strokeWidth={1}
            stroke={'rgb(50,50,50)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return `${date.getHours().toString().padStart(2, '0')}h`;
            }}
          />
          <Grid
            axis={'x'}
            position={'top'}
            type={'days'}
            strokeWidth={3}
            stroke={'rgb(100,100,100)'}
            formatter={(v: number) => {
              const date = new Date(v);
              return [
                [
                  'dimanche',
                  'lundi',
                  'mardi',
                  'mercredi',
                  'jeudi',
                  'vendredi',
                  'samedi',
                ][date.getDay()],
                date.getDate().toString(),
              ].join(' ');
            }}
          />
          <Lines
            colors={[
              {
                positiveColor: 'rgba(0, 102, 255, 1)',
                negativeColor: 'rgba(0, 102, 255, 1)',
              },
            ]}
          />
          <Pointer />
        </Graph>
        <Text style={styles.graphTitle}>Snow (cm)</Text>
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
    marginBottom: 60,
  },
});
