import { HourlyTravelMonitor, Region } from '../HourlyTravelMonitor'; // Adjust the import path as necessary
import { IWeatherData } from '../IWeatherData'; // Adjust the import path as necessary
import * as dotenv from 'dotenv';

dotenv.config({ path: 'src/.env' });

describe('HourlyTravelMonitor API Tests', () => {


    let travelMonitor: HourlyTravelMonitor;
    const apiKey = process.env.OPENAI_API_KEY;
    const weatherKey = process.env.WEATHER_API_KEY;

    beforeAll(() => {
        // Check if API keys are available
        if (!apiKey || !weatherKey) {
            throw new Error('OpenAI and Weather API keys must be set in environment variables to run these tests.');
        }
        travelMonitor = new HourlyTravelMonitor();
    });

    it('should successfully fetch weather data for a specific city', async () => {
        const city = 'London';
        const country = 'UK';

        const weatherData: IWeatherData = await travelMonitor['getWeatherData'](city, country);

        expect(weatherData).toBeDefined();
        expect(typeof weatherData.temperature).toBe('number');
        expect(typeof weatherData.conditions).toBe('string');
        expect(typeof weatherData.humidity).toBe('number');
        expect(typeof weatherData.windSpeed).toBe('number');

        console.log(`Weather in ${city}, ${country}:`, weatherData);
    }, 30000);

    it('should return a valid list of top cities with weather data for a specific region', async () => {
        const region: Region = 'Europe';

        const citiesWithWeather = await travelMonitor['getTopCitiesWithWeather'](region);

        expect(citiesWithWeather).toBeDefined();
        expect(Array.isArray(citiesWithWeather)).toBe(true);
        expect(citiesWithWeather.length).toBeGreaterThan(0);

        citiesWithWeather.forEach((city: any) => {
            expect(city).toHaveProperty('name');
            expect(city).toHaveProperty('country');
            expect(city).toHaveProperty('weather');
            expect(typeof city.name).toBe('string');
            expect(typeof city.country).toBe('string');
            expect(typeof city.weather.temperature).toBe('number');
            expect(typeof city.weather.conditions).toBe('string');
            expect(typeof city.weather.humidity).toBe('number');
            expect(typeof city.weather.windSpeed).toBe('number');
        });

        console.log(`Top cities with weather in ${region}:`, citiesWithWeather);
    }, 60000);

    it('should successfully get a best city recommendation based on weather conditions', async () => {
        const region: Region = 'NorthAmerica';
        const citiesWithWeather = await travelMonitor['getTopCitiesWithWeather'](region);

        const bestCity = await travelMonitor['getBestCity'](citiesWithWeather);

        expect(bestCity).toBeDefined();
        expect(typeof bestCity.bestCity).toBe('string');
        expect(typeof bestCity.country).toBe('string');
        expect(typeof bestCity.reasoning).toBe('string');

        console.log(`Best city recommendation for ${region}:`, bestCity);
    }, 60000);

    it('should successfully suggest activities for a given city and weather conditions', async () => {
        const cityName = 'Paris';
        const countryName = 'France';
        const weatherConditions = 'Sunny';

        const activities = await travelMonitor.suggestActivities(cityName, countryName, weatherConditions);

        expect(activities).toBeDefined();
        expect(Array.isArray(activities)).toBe(true);
        expect(activities.length).toBeGreaterThan(0);

        activities.forEach((activity: any) => {
            expect(typeof activity).toBe('string');
        });

        console.log(`Suggested activities in ${cityName}, ${countryName} (${weatherConditions}):`, activities);
    }, 30000);
});
