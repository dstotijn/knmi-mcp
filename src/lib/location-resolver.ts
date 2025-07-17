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

/**
 * Location resolver for converting location names to KNMI grid identifiers.
 * Based on the KNMI iOS app GridDefinition approach.
 * @see https://gitlab.com/KNMI-OSS/KNMI-App/knmi-app-ios/-/blob/35a30d8543995b8f297612341b24d5f7f7e8a366/KNMI/SharedLibrary/Sources/GridDefinition/GridDefinition.swift
 */

import residencesData from "./residences.json" with { type: "json" };

export interface LocationPoint {
	id: string;
	name: string;
	normalised: string;
	coordinates: [number, number]; // [longitude, latitude]
	disambiguator: string;
}

/**
 * KNMI Grid Definition parameters (from iOS app).
 */
const KNMI_GRID = {
	southWest: { lat: 50.7, lon: 3.2 },
	northEast: { lat: 53.6, lon: 7.4 },
	steps: { lat: 35, lon: 30 },
	prefix: "A",
	direction: "NWCR", // NorthWestColumnRow
	projection: "epsg4326",
};

/**
 * Convert latitude/longitude coordinates to a grid identifier using KNMI's exact algorithm.
 * Based on GridDefinition.swift from KNMI iOS app.
 */
function coordinatesToGridId(lat: number, lon: number): string {
	const { southWest, northEast, steps, prefix, direction } = KNMI_GRID;

	// Check if coordinate is within grid bounds
	const withinBounds =
		direction === "NWCR"
			? lat > southWest.lat &&
				lat <= northEast.lat &&
				lon >= southWest.lon &&
				lon < northEast.lon
			: lat >= southWest.lat &&
				lat < northEast.lat &&
				lon >= southWest.lon &&
				lon < northEast.lon;

	if (!withinBounds) {
		throw new Error(
			`Coordinate (${lat}, ${lon}) is outside the KNMI grid bounds`,
		);
	}

	// Calculate multipliers
	const latitudeMultiplier = steps.lat / (northEast.lat - southWest.lat);
	const longitudeMultiplier = steps.lon / (northEast.lon - southWest.lon);

	let cellNumber: number;

	if (direction === "NWCR") {
		// NorthWestColumnRow: Cell 0 is in the north west corner
		// First counting from North to South, then going West to East
		const latitudeCell = Math.floor(
			(northEast.lat - lat) * latitudeMultiplier,
		);
		const longitudeCell = Math.floor(
			(lon - southWest.lon) * longitudeMultiplier,
		);
		cellNumber = latitudeCell + longitudeCell * steps.lat;
	} else {
		// SouthWestColumnRow: Cell 0 is in the south west corner
		// First counting from South to North, then going West to East
		const latitudeCell = Math.floor(
			(lat - southWest.lat) * latitudeMultiplier,
		);
		const longitudeCell = Math.floor(
			(lon - southWest.lon) * longitudeMultiplier,
		);
		cellNumber = latitudeCell + longitudeCell * steps.lat;
	}

	return `${prefix}${cellNumber}`;
}

/**
 * Normalize location name for searching.
 */
function normalizeLocationName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, "")
		.trim();
}

/**
 * Resolve location name to grid identifier.
 */
export async function resolveLocation(location: string): Promise<string> {
	const normalizedInput = normalizeLocationName(location);

	// Search for exact name match first
	for (const residence of residencesData as LocationPoint[]) {
		if (
			residence.normalised === normalizedInput ||
			normalizeLocationName(residence.name) === normalizedInput
		) {
			const [lon, lat] = residence.coordinates;
			return coordinatesToGridId(lat, lon);
		}
	}

	// Search for partial matches
	const partialMatches: Array<{ residence: LocationPoint; score: number }> =
		[];

	for (const residence of residencesData as LocationPoint[]) {
		const residenceNormalized = residence.normalised;
		const nameNormalized = normalizeLocationName(residence.name);

		// Calculate match score
		let score = 0;
		if (
			residenceNormalized.includes(normalizedInput) ||
			normalizedInput.includes(residenceNormalized)
		) {
			score += 0.8;
		}
		if (
			nameNormalized.includes(normalizedInput) ||
			normalizedInput.includes(nameNormalized)
		) {
			score += 0.6;
		}

		// Check disambiguator (province/region)
		const disambiguatorNormalized = normalizeLocationName(
			residence.disambiguator,
		);
		if (
			disambiguatorNormalized.includes(normalizedInput) ||
			normalizedInput.includes(disambiguatorNormalized)
		) {
			score += 0.3;
		}

		if (score > 0) {
			partialMatches.push({ residence, score });
		}
	}

	if (partialMatches.length === 0) {
		throw new Error(
			`Location not found: ${location}. Please try a more specific location name.`,
		);
	}

	// Sort by score and return the best match
	partialMatches.sort((a, b) => b.score - a.score);
	const bestMatch = partialMatches[0];
	if (!bestMatch) {
		throw new Error(
			`Location not found: ${location}. Please try a more specific location name.`,
		);
	}

	const [lon, lat] = bestMatch.residence.coordinates;
	return coordinatesToGridId(lat, lon);
}
