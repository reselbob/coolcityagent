import OpenAI from "openai";
import { CronJob } from "cron";
import axios from "axios";
import { IWeatherData } from "./IWeatherData";
import * as dotenv from 'dotenv';

dotenv.config();

export class HourlyTravelMonitor {
    private openai: OpenAI;
    private readonly weatherApiKey: string;
    private job: CronJob | undefined;
    private lastRecommendation: string | null = null;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }
        if (!process.env.WEATHER_API_KEY) {
            throw new Error('Weather API key is required');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.weatherApiKey = process.env.WEATHER_API_KEY;
    }

    private async getWeatherData(city: string, country: string): Promise<IWeatherData> {
        try {
            const response = await axios.get(
                `https://api.weatherapi.com/v1/current.json?key=${this.weatherApiKey}&q=${city}`
            );

            return {
                temperature: response.data.current.temp_c,
                conditions: response.data.current.condition.text,
                humidity: response.data.current.humidity,
                windSpeed: response.data.current.wind_kph
            };
        } catch (error) {
            console.error(`Failed to fetch weather for ${city}:`, error);
            throw error;
        }
    }

    private async getTopCitiesWithWeather() {
        try {
            // First, get top tourist cities
            const citiesResponse = await this.openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{
                    role: "user",
                    content: "List the top 20 most visited tourist cities in the world. Return only a JSON array of objects with 'name' and 'country' properties."
                }],
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            const cities = JSON.parse(<string>citiesResponse.choices[0].message.content).cities;

            // Get weather data for each city
            const citiesWithWeather = await Promise.all(
                cities.map(async (city: { name: string; country: string }) => {
                    try {
                        const weather = await this.getWeatherData(city.name, city.country);
                        return {
                            ...city,
                            weather
                        };
                    } catch (error) {
                        console.error(`Skipping ${city.name} due to error:`, error);
                        return null;
                    }
                })
            );

            return citiesWithWeather.filter(city => city !== null);
        } catch (error) {
            console.error('Failed to get cities with weather:', error);
            throw error;
        }
    }

    private async getBestCity(citiesWithWeather: any[]) {
        try {
            const prompt = `Based on this current weather data for top tourist cities, recommend the single best city to visit right now. Consider temperature (20-25°C ideal), weather conditions, humidity (40-60% ideal), and wind speed (5-15 kph ideal).

Cities and their current conditions:
${citiesWithWeather.map(city => `
${city.name}, ${city.country}:
- Temperature: ${city.weather.temperature}°C
- Weather: ${city.weather.conditions}
- Humidity: ${city.weather.humidity}%
- Wind Speed: ${city.weather.windSpeed} kph
`).join('\n')}

Return your response in this JSON format:
{
  "bestCity": "city name",
  "country": "country name",
  "reasoning": "detailed explanation of why this city is the best choice right now"
}`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                response_format: { type: "json_object" },
                temperature: 0.5
            });

            return JSON.parse(<string>response.choices[0].message.content);
        } catch (error) {
            console.error('Failed to get best city recommendation:', error);
            throw error;
        }
    }

    public async suggestActivities(cityName: string, countryName: string, weatherConditions: string): Promise<string[]> {
        try {
            const prompt = `Given the following city and current weather conditions, suggest 5 activities that would be perfect to do today. Consider both popular tourist attractions and local experiences.

City: ${cityName}, ${countryName}
Current weather: ${weatherConditions}

Return your response as a JSON array of strings, with each string being a suggested activity.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                response_format: { type: "json_object" },
                temperature: 0.7
            });

            const activities = JSON.parse(<string>response.choices[0].message.content).activities;
            return activities;
        } catch (error) {
            console.error('Failed to get activity suggestions:', error);
            throw new Error('Could not generate activity suggestions');
        }
    }

    private async checkAndRecommend() {
        console.log(`\nChecking travel recommendations at ${new Date().toLocaleString()}`);

        try {
            const citiesWithWeather = await this.getTopCitiesWithWeather();
            const recommendation = await this.getBestCity(citiesWithWeather);

            // Get activity suggestions for the recommended city
            const activities = await this.suggestActivities(
                recommendation.bestCity,
                recommendation.country,
                citiesWithWeather.find(c => c.name === recommendation.bestCity)?.weather.conditions || 'good weather'
            );

            // Only print if recommendation has changed
            if (this.lastRecommendation !== recommendation.bestCity) {
                console.log('\n=== New Travel Recommendation ===');
                console.log(`Best City: ${recommendation.bestCity}, ${recommendation.country}`);
                console.log(`Reasoning: ${recommendation.reasoning}`);
                console.log('\nTop 5 Things to Do Today:');
                activities.forEach((activity, index) => {
                    console.log(`${index + 1}. ${activity}`);
                });
                console.log('================================\n');

                this.lastRecommendation = recommendation.bestCity;
            } else {
                console.log(`Recommendation unchanged: ${recommendation.bestCity} is still the best choice`);
            }
        } catch (error) {
            console.error('Error during recommendation check:', error);
        }
    }

    public async start() {
        console.log('Starting hourly travel monitoring...');

        // Run immediately on start - now with await
        await this.checkAndRecommend();

        // Then schedule hourly checks
        this.job = new CronJob('0 * * * *', async () => {
            await this.checkAndRecommend();
        });

        this.job.start();
    }

    public stop() {
        if (this.job) {
            this.job.stop();
            console.log('Travel monitoring stopped');
        }
    }
}
