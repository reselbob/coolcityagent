# Cool Cities AI Agent
A project the demonstrates an AI Agent that interacts with LLMs via the OpenAI API.

The code is this project asks OpenAI to find a city with optimal weather conditions and then suggest activities to do tin that city. Also, the code has an option to call a city according to a global region, for example, Europe, Asia, etc... .

# Getting up and running

## Export the environment variables

You'll need API key for both ChatGPT (OpenAI) and the Weather API. You can get the API key for [ChatGPT (OpenAI) website](https://platform.openai.com/docs/overview) and the API key from the [WeatherAPI website](https://www.weatherapi.com/signup.aspx).

Once in hand, at the terminal window for the process you are running, export the following environment variables:

```bash
export OPENAI_API_KEY=<your_openai_api_key>
export WEATHER_API_KEY=<your_weather_api_key>
```

## Install the dependencies

```bash
npm install
```
## Run the code

```bash
ts-node src/agent.ts
```

When you run the code in `agent.ts`, you will see the output similar to the following:

```text
Starting hourly travel monitoring for NorthAmerica...

Checking travel recommendations for NorthAmerica at 2/16/2025, 3:01:02 PM

=== New Travel Recommendation for NorthAmerica ===
Best City: Los Angeles, USA
Reasoning: Los Angeles offers the most ideal weather conditions based on the specified criteria. The temperature in Los Angeles is 21.1°C, which falls within the ideal range of 20-25°C. The weather is sunny, providing a pleasant atmosphere for outdoor activities and sightseeing. Although the humidity is slightly below the ideal range at 28%, it is still comfortable for most people. The wind speed is 9 kph, which is within the ideal range of 5-15 kph, ensuring that it's not too calm or too windy. Considering all these factors, Los Angeles stands out as the best city to visit right now.

Top 5 Things to Do Today:
1. Take a walk along the Santa Monica Pier and enjoy the ocean views.
2. Explore the Griffith Observatory for stunning city views and a closer look at the stars.
3. Visit the Getty Center to enjoy world-class art collections and beautiful garden areas.
4. Spend the day at Venice Beach, experiencing the unique street performers and the vibrant skateboarding culture.
5. Hike to the Hollywood Sign for an iconic Los Angeles experience and a great photo opportunity.
================================
```




