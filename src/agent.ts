import * as dotenv from 'dotenv';
import {HourlyTravelMonitor} from './HourlyTravelMonitor';
dotenv.config({ path: '.env' });


// Example usage
async function runTravelMonitor() {
  const monitor = new HourlyTravelMonitor();

  // Start monitoring
  await monitor.start('NorthAmerica');

  // Optional: Stop after 24 hours
  setTimeout(() => {
    monitor.stop();
    console.log('Monitoring stopped after 24 hours');
  }, 24 * 60 * 60 * 1000);
}

// Run the monitor
runTravelMonitor().catch(console.error);
