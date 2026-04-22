import { createClient } from "@supabase/supabase-js";

const WEATHER_KEY = "53eb7953df8070c48d270ae06608aaf9";

const WEATHER_ENDPOINT =
  import.meta.env.VITE_OPENWEATHER_URL ??
  "https://api.openweathermap.org/data/2.5/weather?q=Cavite&appid=" +
    WEATHER_KEY +
    "&units=metric";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://gmtjsfnujfyjbebjdibb.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdGpzZm51amZ5amJlYmpkaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDI3OTksImV4cCI6MjA4NjQxODc5OX0.wYs4MXPbY9GmpJZ5kilSGykgLV_udSK9Oqe_WQ2moDk";

const PUBLIC_HOLIDAY_COUNTRY =
  import.meta.env.VITE_PUBLIC_HOLIDAY_COUNTRY ?? "PH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateLabel(dateValue) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function buildWeatherFallback() {
  return {
    live: false,
    city: "Manila",
    country: "PH",
    temperature: 31,
    feelsLike: 35,
    humidity: 68,
    windSpeed: 12,
    description: "Partly cloudy",
    condition: "Clouds",
    advice:
      "Weather data is using a local estimate while the live feed reconnects.",
    updatedAt: null,
  };
}

function getWeatherAdvice(condition, temperature, humidity) {
  const normalizedCondition = condition.toLowerCase();

  if (normalizedCondition.includes("rain")) {
    return "Rain is likely. Publish later or keep the next module remote-friendly.";
  }

  if (temperature >= 33) {
    return "Very hot conditions. Morning publishing will likely be more comfortable.";
  }

  if (temperature <= 24) {
    return "Cooler weather. Good time for an outdoor or movement-based module.";
  }

  if (humidity >= 80) {
    return "High humidity. Keep the module lightweight and timing flexible.";
  }

  return "Weather looks stable enough for a normal publishing window.";
}

function buildDashboardFallback() {
  return {
    live: false,
    modulesCount: 0,
    sectionsCount: 0,
    activitiesCount: 0,
    learnersCount: 0,
    sessionsCount: 0,
    averageScore: 0,
    passingRate: 0,
    updatedAt: null,
  };
}

function buildHolidayFallback() {
  return {
    live: false,
    name: "No public holiday data",
    englishName: "No public holiday data",
    date: null,
    dateLabel: "Unavailable",
    daysUntil: null,
    countryCode: PUBLIC_HOLIDAY_COUNTRY,
    note: "The free public holiday API is currently unavailable.",
  };
}

export async function fetchCurrentWeather() {
  try {
    const response = await fetch(WEATHER_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Weather request failed with ${response.status}`);
    }

    const data = await response.json();
    const main = data?.weather?.[0]?.main ?? "Clouds";
    const description = data?.weather?.[0]?.description ?? "partly cloudy";
    const temperature = Number(data?.main?.temp ?? 0);
    const feelsLike = Number(data?.main?.feels_like ?? temperature);
    const humidity = Number(data?.main?.humidity ?? 0);
    const windSpeed = Number(data?.wind?.speed ?? 0);

    return {
      live: true,
      city: data?.name ?? "Manila",
      country: data?.sys?.country ?? "PH",
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      description,
      condition: main,
      advice: getWeatherAdvice(main, temperature, humidity),
      updatedAt: data?.dt
        ? new Date(data.dt * 1000).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...buildWeatherFallback(),
      error: error instanceof Error ? error.message : "Unable to load weather.",
    };
  }
}

export async function fetchDashboardSummary() {
  try {
    const { data, error } = await supabase.rpc("get_dashboard_summary");
    if (error) {
      throw error;
    }

    const summary = Array.isArray(data) ? data[0] : data;
    if (!summary) {
      throw new Error("Empty dashboard summary.");
    }

    return {
      live: true,
      modulesCount:
        summary.modules_count ?? buildDashboardFallback().modulesCount,
      sectionsCount:
        summary.sections_count ?? buildDashboardFallback().sectionsCount,
      activitiesCount:
        summary.activities_count ?? buildDashboardFallback().activitiesCount,
      learnersCount:
        summary.learners_count ?? buildDashboardFallback().learnersCount,
      sessionsCount:
        summary.sessions_count ?? buildDashboardFallback().sessionsCount,
      averageScore:
        summary.average_score ?? buildDashboardFallback().averageScore,
      passingRate: summary.passing_rate ?? buildDashboardFallback().passingRate,
      updatedAt: summary.updated_at ?? null,
    };
  } catch (error) {
    return {
      ...buildDashboardFallback(),
      error:
        error instanceof Error
          ? error.message
          : "Unable to load Supabase summary.",
    };
  }
}

export async function fetchUpcomingPublicHoliday() {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/NextPublicHolidays/${PUBLIC_HOLIDAY_COUNTRY}`,
    );
    if (!response.ok) {
      throw new Error(`Holiday request failed with ${response.status}`);
    }

    const data = await response.json();
    const nextHoliday = Array.isArray(data)
      ? (data.find((item) => item?.date) ?? data[0])
      : null;

    if (!nextHoliday) {
      throw new Error("No holiday returned.");
    }

    const holidayDate = new Date(`${nextHoliday.date}T00:00:00`);
    const today = startOfToday();
    const daysUntil = Math.max(
      Math.round((holidayDate.getTime() - today.getTime()) / 86400000),
      0,
    );

    return {
      live: true,
      name: nextHoliday.localName || nextHoliday.name,
      englishName: nextHoliday.name,
      date: nextHoliday.date,
      dateLabel: formatDateLabel(nextHoliday.date),
      daysUntil,
      countryCode: nextHoliday.countryCode ?? PUBLIC_HOLIDAY_COUNTRY,
      note:
        daysUntil <= 7
          ? "Good window to keep publishing light and easy to review."
          : "Useful for planning module releases ahead of the next break.",
    };
  } catch (error) {
    return {
      ...buildHolidayFallback(),
      error:
        error instanceof Error ? error.message : "Unable to load holiday data.",
    };
  }
}
