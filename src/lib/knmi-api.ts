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

import type { components } from "../types/knmi-api.js";
import { createKnmiClient, type KnmiClientOptions } from "./knmi-client.js";
import { resolveLocation } from "./location-resolver.js";

/**
 * Utility class for interacting with the KNMI API.
 */
export class KnmiApi {
	private client: ReturnType<typeof createKnmiClient>;

	constructor(options: KnmiClientOptions = {}) {
		this.client = createKnmiClient(options);
	}

	/**
	 * Get the API version.
	 */
	async getVersion() {
		const { data, error } = await this.client.GET("/version");
		if (error) {
			throw new Error(
				`Failed to get version: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get current weather alerts.
	 */
	async getWeatherAlerts() {
		const { data, error } = await this.client.GET("/alerts");
		if (error) {
			throw new Error(
				`Failed to get weather alerts: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get weather alerts snapshot.
	 */
	async getWeatherAlertsSnapshot() {
		const { data, error } = await this.client.GET("/alerts/snapshot");
		if (error) {
			throw new Error(
				`Failed to get weather alerts snapshot: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get precipitation radar data.
	 */
	async getPrecipitationRadar() {
		const { data, error } = await this.client.GET("/precipitation/radar");
		if (error) {
			throw new Error(
				`Failed to get precipitation radar: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get precipitation graph for a specific location and time.
	 *
	 * @param location Location name (e.g., 'Amsterdam', 'De Bilt')
	 * @param time Date/time for precipitation data (rounded to 5 minutes)
	 */
	async getPrecipitationGraph(location: string, time: string) {
		// Resolve location name to grid identifier
		const locationId = await resolveLocation(location);

		const { data, error } = await this.client.GET("/precipitation/graph", {
			params: {
				query: { location: locationId, time },
			},
		});
		if (error) {
			throw new Error(
				`Failed to get precipitation graph: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get seismic activity data.
	 */
	async getSeismicData() {
		const { data, error } = await this.client.GET("/seismic");
		if (error) {
			throw new Error(
				`Failed to get seismic data: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get wind speed measurements.
	 *
	 * @param unit Measurement unit (Beaufort scale)
	 */
	async getWindSpeedMeasurements(
		unit: components["schemas"]["MeasurementUnit"],
	) {
		const { data, error } = await this.client.GET(
			"/measurements/windspeed",
			{
				params: {
					query: { unit },
				},
			},
		);
		if (error) {
			throw new Error(
				`Failed to get wind speed measurements: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get wind gusts measurements.
	 *
	 * @param unit Measurement unit (km/h)
	 */
	async getWindGustsMeasurements(
		unit: components["schemas"]["MeasurementUnit"],
	) {
		const { data, error } = await this.client.GET(
			"/measurements/windgusts",
			{
				params: {
					query: { unit },
				},
			},
		);
		if (error) {
			throw new Error(
				`Failed to get wind gusts measurements: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get temperature measurements.
	 *
	 * @param unit Measurement unit (Celsius)
	 */
	async getTemperatureMeasurements(
		unit: components["schemas"]["MeasurementUnit"],
	) {
		const { data, error } = await this.client.GET(
			"/measurements/temperature",
			{
				params: {
					query: { unit },
				},
			},
		);
		if (error) {
			throw new Error(
				`Failed to get temperature measurements: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get humidity measurements.
	 *
	 * @param unit Measurement unit (percentage)
	 */
	async getHumidityMeasurements(
		unit: components["schemas"]["MeasurementUnit"],
	) {
		const { data, error } = await this.client.GET(
			"/measurements/humidity",
			{
				params: {
					query: { unit },
				},
			},
		);
		if (error) {
			throw new Error(
				`Failed to get humidity measurements: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get weather information for a location.
	 *
	 * @param location Location name (e.g., 'Amsterdam', 'De Bilt')
	 * @param region Optional region number
	 */
	async getWeather(location: string, region?: number) {
		// Resolve location name to grid identifier
		const locationId = await resolveLocation(location);

		const { data, error } = await this.client.GET("/weather", {
			params: {
				query: { location: locationId, region },
			},
		});
		if (error) {
			throw new Error(
				`Failed to get weather: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get detailed weather information for a location.
	 *
	 * @param location Location name (e.g., 'Amsterdam', 'De Bilt')
	 * @param date Date for weather data
	 * @param region Optional region number
	 */
	async getWeatherDetail(location: string, date: string, region?: number) {
		// Resolve location name to grid identifier
		const locationId = await resolveLocation(location);

		const { data, error } = await this.client.GET("/weather/detail", {
			params: {
				query: { location: locationId, date, region },
			},
		});
		if (error) {
			throw new Error(
				`Failed to get weather detail: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}

	/**
	 * Get weather snapshot for a location.
	 *
	 * @param location Location name (e.g., 'Amsterdam', 'De Bilt')
	 * @param region Optional region number
	 */
	async getWeatherSnapshot(location: string, region?: number) {
		// Resolve location name to grid identifier
		const locationId = await resolveLocation(location);

		const { data, error } = await this.client.GET("/weather/snapshot", {
			params: {
				query: { location: locationId, region },
			},
		});
		if (error) {
			throw new Error(
				`Failed to get weather snapshot: ${(error as components["schemas"]["ErrorResponse"]).title || "Unknown error"}`,
			);
		}
		return data;
	}
}
