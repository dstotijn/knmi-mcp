# KNMI MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that
provides access to Dutch weather data via the KNMI (Royal Netherlands
Meteorological Institute) API.

## Overview

This MCP server enables AI assistants and applications to access comprehensive
Dutch weather information, including current conditions, forecasts, alerts, and
historical data. It automatically handles location name resolution, converting
human-readable Dutch city names into KNMI grid identifiers.

## MCP Tools

### `get_weather`

Get comprehensive weather information for any Dutch location.

**Parameters:**

-   `location` (string, required): Dutch location name (e.g., "Amsterdam", "De
    Bilt"). Will (fuzzy) matched to a well-known/mapped locality.
-   `region` (number, optional): Region number (0-15) for additional regional
    context

**Returns:**

-   Current weather conditions and temperature
-   Hourly forecast (next 48 hours)
-   Daily forecast (next 7 days)
-   Weather alerts and warnings
-   Wind conditions (speed, direction, gusts)
-   Precipitation data (amount, chance)
-   UV index information
-   Sunrise and sunset times
-   Weather backgrounds for visual representation

## MCP Client Configuration

Add to your MCP host configuration (e.g. Claude Desktop, VS Code, etcetera):

```json
{
	"knmi-weather": {
		"command": "npx",
		"args": ["-y", "@dstotijn/knmi-mcp"]
	}
}
```

## Weather Data Structure

### Current Conditions

-   Temperature (°C)
-   Weather type code
-   Wind speed, direction, and gusts
-   Precipitation amount and probability
-   UV index with safety recommendations

### Forecasts

-   **Hourly**: Next 48 hours with detailed conditions
-   **Daily**: Next 7 days with min/max temperatures and precipitation

### Alerts

-   Alert levels: none, potential, yellow, orange, red
-   Detailed descriptions and safety advice
-   Affected regions and time periods

### Additional Data

-   Sunrise and sunset times
-   Weather backgrounds for UI visualization
-   Regional weather information
-   Historical climate data context

## License

[Apache License, Version 2.0](LICENSE)

---

©️ 2025 David Stotijn
