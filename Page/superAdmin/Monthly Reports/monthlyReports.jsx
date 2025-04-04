import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const monthlyData = {
  April: {
    litres: [10, 20, 15, 50, 25, 18, 22, 15, 12, 14, 18, 20, 22, 25, 18],
    pricePerLitre: 20,
  },
  March: {
    litres: [8, 18, 14, 28, 22, 16, 20, 15, 12, 13, 17, 19, 21, 23, 16],
    pricePerLitre: 18,
  },
  February: {
    litres: [12, 22, 18, 26, 20, 15, 19, 15, 12, 14, 16, 18, 20, 22, 15],
    pricePerLitre: 19,
  },
  January: {
    litres: [9, 19, 17, 24, 21, 14, 18, 15, 12, 13, 15, 17, 19, 21, 14],
    pricePerLitre: 17,
  },
};

const getTotal = (litres, pricePerLitre) => {
  const totalLitres = litres.reduce((sum, val) => sum + val, 0);
  const totalRevenue = totalLitres * pricePerLitre;
  return {totalLitres, totalRevenue};
};

const MonthlyReports = () => {
  const months = Object.keys(monthlyData);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [chartData, setChartData] = useState(monthlyData[months[0]].litres);
  const [pricePerLitre, setPricePerLitre] = useState(
    monthlyData[months[0]].pricePerLitre,
  );
  const {totalLitres, totalRevenue} = getTotal(chartData, pricePerLitre);
  const scrollViewRef = useRef();

  const showCurrentMonth = () => {
    setSelectedMonth(months[0]);
    updateData(months[0]);
    scrollToStart();
  };

  const showPreviousMonth = () => {
    if (months.length > 1) {
      setSelectedMonth(months[1]);
      updateData(months[1]);
      scrollToStart();
    }
  };

  const updateData = month => {
    setChartData(monthlyData[month].litres);
    setPricePerLitre(monthlyData[month].pricePerLitre);
  };

  const scrollToStart = () => {
    scrollViewRef.current?.scrollTo({x: 0, animated: true});
  };

  // Calculate chart width based on number of data points
  const chartWidth = Math.max(screenWidth, chartData.length * 60);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Monthly Reports</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.monthButton,
            selectedMonth === months[0] && styles.activeButton,
          ]}
          onPress={showCurrentMonth}>
          <Text
            style={[
              styles.buttonText,
              selectedMonth === months[0] && styles.activeButtonText,
            ]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.monthButton,
            selectedMonth === months[1] && styles.activeButton,
            months.length < 2 && styles.disabledButton,
          ]}
          onPress={showPreviousMonth}
          disabled={months.length < 2}>
          <Text
            style={[
              styles.buttonText,
              selectedMonth === months[1] && styles.activeButtonText,
            ]}>
            Previous Month
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.chartTitle}>Milk Collection - {selectedMonth}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        ref={scrollViewRef}
        style={styles.chartScrollView}>
        <BarChart
          data={{
            labels: chartData.map((_, index) => (index + 1).toString()),
            datasets: [{data: chartData}],
          }}
          width={chartWidth}
          height={420}
          yAxisSuffix=" L"
          fromZero
          chartConfig={chartConfig}
          style={styles.chartStyle}
          showBarTops={false}
          withCustomBarColorFromData={false}
          flatColor={false}
          withInnerLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withAnimation={true}
          animationDuration={2000}
          segments={4}
        />
      </ScrollView>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalLitres} L</Text>
          <Text style={styles.statLabel}>Total Milk</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{totalRevenue}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A5866',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  monthButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#2A5866',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
  },
  chartTitle: {
    fontSize: 20,
    // fontWeight: 'bold',
    color: '#2A5866',
    marginTop: 10,
    textAlign: 'center',
  },
  chartScrollView: {
    marginVertical: 10,
    borderRadius: 8,
  },
  chartStyle: {
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 5,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A5866',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#6a11cb',
  backgroundGradientTo: '#2575fc',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White text
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White labels
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
  fillShadowGradient: '#2575fc',
  fillShadowGradientOpacity: 0.5,
  barPercentage: 0.7,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: 'rgba(255, 255, 255, 0.2)',
    strokeDasharray: '0',
  },
  propsForLabels: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  useShadowColorFromDataset: false,
  barRadius: 4,
  formatYLabel: value => `${value}L`, // Custom Y-axis label format
  formatXLabel: value => `Day ${value}`, // Custom X-axis label format
  strokeWidth: 2, // For line charts (if used)
  scrollableInfoTextStyle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollableInfoViewStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
};

export default MonthlyReports;
