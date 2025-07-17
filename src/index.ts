#!/usr/bin/env node

/**
 * Copyright 2025 David Stotijn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { KnmiApi } from "./lib/knmi-api.js";

const knmiApi = new KnmiApi({ environment: "production" });
const server = new McpServer({
	name: "knmi-mcp",
	version: "0.1.0",
});

// Define the weather output schema based on the OpenAPI spec
const weatherOutputSchema = z.object({
	backgrounds: z
		.array(
			z.object({
				dateTime: z
					.string()
					.describe(
						"Date of the background, the time from when this background is to be used",
					),
				sky: z.enum([
					"dayClear",
					"dayLightCloud",
					"dayMediumCloud",
					"dayHeavyCloud",
					"nightClear",
					"nightMediumCloud",
					"nightHeavyCloud",
				]),
				celestial: z.enum(["sun", "moon"]).optional(),
				clouds: z
					.enum([
						"dayMist",
						"dayLightCloud",
						"dayMediumCloud",
						"dayHeavyCloud",
						"dayHeavyCloudLightning",
						"nightMist",
						"nightLightCloud",
						"nightMediumCloud",
						"nightHeavyCloud",
						"nightHeavyCloudLightning",
					])
					.optional(),
				precipitation: z
					.enum([
						"lightRain",
						"mediumRain",
						"heavyRain",
						"hail",
						"lightSnow",
						"mediumSnow",
						"heavySnow",
					])
					.optional(),
			}),
		)
		.optional()
		.describe("The weather backgrounds to be used"),
	summaries: z
		.array(
			z.object({
				dateTime: z
					.string()
					.describe(
						"Date of the summary, the time from when this summary is to be used",
					),
				temperature: z
					.number()
					.optional()
					.describe("Current temperature in degrees Celsius"),
			}),
		)
		.describe("Summary of the current weather conditions to be used"),
	alerts: z
		.array(
			z.object({
				level: z
					.enum(["none", "potential", "yellow", "orange", "red"])
					.describe("The alert level"),
				title: z.string().describe("The title of the alert"),
				description: z
					.string()
					.describe("The description of the alert"),
			}),
		)
		.describe("Alerts for this location in the next 48 hours"),
	hourly: z
		.object({
			forecast: z
				.array(
					z.object({
						dateTime: z.string().describe("Date of the forecast"),
						alertLevel: z
							.enum([
								"none",
								"potential",
								"yellow",
								"orange",
								"red",
							])
							.optional()
							.describe(
								"Highest alert level active for the hour",
							),
						weatherType: z
							.number()
							.describe("Type of weather condition"),
						temperature: z
							.number()
							.describe("Temperature for the hour"),
						precipitation: z
							.object({
								amount: z
									.number()
									.describe(
										"Amount of rain in millimeter per hour",
									),
								chance: z
									.number()
									.describe("Chance of rain as a percentage"),
							})
							.describe("Precipitation information for the hour"),
						wind: z
							.object({
								source: z.enum([
									"N",
									"NNE",
									"NE",
									"ENE",
									"E",
									"ESE",
									"SE",
									"SSE",
									"S",
									"SSW",
									"SW",
									"WSW",
									"W",
									"WNW",
									"NW",
									"NNW",
									"VAR",
								]),
								speed: z
									.number()
									.describe(
										"The wind speed in kilometers/hour",
									),
								gusts: z
									.number()
									.describe(
										"The wind gusts in kilometers/hour",
									),
								degree: z
									.number()
									.optional()
									.describe(
										"Wind source in degrees (meteorological convention, 0 degrees represents north)",
									),
								beaufort: z
									.number()
									.describe(
										"The wind speed according to the Beaufort scale",
									),
							})
							.optional()
							.describe("Wind information for the hour"),
					}),
				)
				.describe("Entries with weather forecast"),
		})
		.optional()
		.describe("Hourly forecast for the weather"),
	daily: z
		.object({
			forecast: z
				.array(
					z.object({
						date: z.string().describe("Date of the forecast"),
						alertLevels: z
							.array(
								z.enum([
									"none",
									"potential",
									"yellow",
									"orange",
									"red",
								]),
							)
							.optional()
							.describe("All alert levels active for the day"),
						weatherType: z
							.number()
							.optional()
							.describe("Type of weather condition"),
						temperature: z
							.object({
								min: z
									.number()
									.optional()
									.describe(
										"The minimum temperature in degrees Celsius",
									),
								max: z
									.number()
									.optional()
									.describe(
										"The maximum temperature in degrees Celsius",
									),
							})
							.describe("Temperature range for the day"),
						precipitation: z
							.object({
								amount: z
									.number()
									.describe(
										"Amount of rain in millimeter per hour",
									),
								chance: z
									.number()
									.describe("Chance of rain as a percentage"),
							})
							.describe("Precipitation information for the day"),
					}),
				)
				.describe("Entries with weather forecast"),
		})
		.optional()
		.describe("Daily forecast for the weather"),
	sun: z
		.object({
			sunrise: z.string().describe("The time of sunrise"),
			sunset: z.string().describe("The time of sunset"),
		})
		.optional()
		.describe("Sunrise and sunset times"),
	wind: z
		.object({
			source: z.enum([
				"N",
				"NNE",
				"NE",
				"ENE",
				"E",
				"ESE",
				"SE",
				"SSE",
				"S",
				"SSW",
				"SW",
				"WSW",
				"W",
				"WNW",
				"NW",
				"NNW",
				"VAR",
			]),
			speed: z.number().describe("The wind speed in kilometers/hour"),
			gusts: z.number().describe("The wind gusts in kilometers/hour"),
			degree: z
				.number()
				.optional()
				.describe(
					"Wind source in degrees (meteorological convention, 0 degrees represents north)",
				),
			beaufort: z
				.number()
				.describe("The wind speed according to the Beaufort scale"),
		})
		.optional()
		.describe("Wind information for the current weather"),
	uvIndex: z
		.object({
			value: z.number().describe("UV index value"),
			summary: z
				.string()
				.describe("A human-readable description of the UV index"),
		})
		.optional()
		.describe("UV index data for the current weather"),
});

server.registerTool(
	"get_weather",
	{
		title: "Get Weather",
		description:
			"Get current weather information for a Dutch location. The location parameter accepts location names (e.g., 'Amsterdam', 'De Bilt') and automatically converts them to the required grid identifiers.",
		inputSchema: {
			location: z
				.string()
				.describe("Location name (e.g., 'Amsterdam', 'De Bilt')"),
			region: z
				.number()
				.int()
				.min(0)
				.max(15)
				.optional()
				.describe("Optional region number (0-15)"),
		},
		outputSchema: weatherOutputSchema.shape,
		annotations: {
			readOnlyHint: true,
		},
	},
	async ({ location, region }) => {
		try {
			const weatherData = await knmiApi.getWeather(location, region);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(weatherData),
					},
				],
				structuredContent: weatherData,
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: `Error fetching weather data: ${error instanceof Error ? error.message : String(error)}`,
					},
				],
				isError: true,
			};
		}
	},
);

const transport = new StdioServerTransport();
console.error("Starting MCP server...");
await server.connect(transport);
