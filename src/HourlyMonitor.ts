import * as dotenv from 'dotenv';
import {HourlyTravelMonitor} from './HourlyTravelMonitor';
dotenv.config();


// Example usage
async function runTravelMonitor() {
  const monitor = new HourlyTravelMonitor();

  // Start monitoring
  monitor.start();

  // Optional: Stop after 24 hours
  setTimeout(() => {
    monitor.stop();
    console.log('Monitoring stopped after 24 hours');
  }, 24 * 60 * 60 * 1000);
}

// Run the monitor
runTravelMonitor().catch(console.error);
