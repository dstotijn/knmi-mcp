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

import createClient from "openapi-fetch";
import type { paths } from "../types/knmi-api.js";

/**
 * KNMI API Environment URLs.
 */
export const KNMI_API_ENVIRONMENTS = {
	development: "https://api.app.dev.knmi.cloud",
	acceptance: "https://api.app.acc.knmi.cloud",
	production: "https://api.app.knmi.cloud",
} as const;

export type KnmiEnvironment = keyof typeof KNMI_API_ENVIRONMENTS;

/**
 * Configuration options for the KNMI API client.
 */
export interface KnmiClientOptions {
	/** API environment to use. */
	environment?: KnmiEnvironment;
	/** Custom base URL (overrides environment). */
	baseUrl?: string;
	/** Additional fetch options. */
	fetchOptions?: RequestInit;
}

/**
 * Create a typed KNMI API client.
 *
 * @param options Client configuration options
 * @returns Configured KNMI API client
 *
 * @example
 * ```typescript
 * // Production client
 * const client = createKnmiClient({ environment: 'production' });
 *
 * // Development client
 * const devClient = createKnmiClient({ environment: 'development' });
 *
 * // Custom URL
 * const customClient = createKnmiClient({ baseUrl: 'https://custom-api.example.com' });
 * ```
 */
export function createKnmiClient(options: KnmiClientOptions = {}) {
	const { environment = "production", baseUrl, fetchOptions } = options;

	const url = baseUrl || KNMI_API_ENVIRONMENTS[environment];

	return createClient<paths>({
		baseUrl: url,
		...fetchOptions,
	});
}

/**
 * Default KNMI API client (production environment).
 */
export const knmiClient = createKnmiClient();

/**
 * KNMI API client for development environment.
 */
export const knmiDevClient = createKnmiClient({ environment: "development" });

/**
 * KNMI API client for acceptance environment.
 */
export const knmiAccClient = createKnmiClient({ environment: "acceptance" });
