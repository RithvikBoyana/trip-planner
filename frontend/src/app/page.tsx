'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [destination, setDestination] = useState('');
  const [interests, setInterests] = useState('');
  const [days, setDays] = useState(3);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [daysError, setDaysError] = useState(false); // New state for error

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const interestsArray = interests.trim() === '' ? ["popular tourist spots", "basic plan"] : interests.split(',');

    if (days < 2 || days > 10) {
      setDaysError(true);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:8000/generate-itinerary", {
        destination,
        interests: interestsArray,
        days,
      });

      const daysData = parseItinerary(response.data.itinerary);
      setItinerary(daysData);
      setCurrentDayIndex(0);
    } catch (error) {
      console.error("Error generating itinerary:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseItinerary = (response: string) => {
    const daysArray = response.split(/(Day \d+)/).filter(Boolean);
    const formattedDays = [];
    for (let i = 0; i < daysArray.length; i += 2) {
      const dayTitle = daysArray[i].trim();
      const dayContent = daysArray[i + 1]?.trim();
      const cleanedSections = cleanSections(dayContent);
      formattedDays.push({ title: dayTitle, sections: cleanedSections });
    }

    return formattedDays;
  };

  const cleanSections = (content: string) => {
    const sections = content?.split(/(Morning:|Afternoon:|Evening:|Night:)/).filter(Boolean).map((section) => section.trim());
    const cleaned = sections.filter((section) => section && section !== ":");
    return cleaned;
  };

  const nextDay = () => { if (currentDayIndex < itinerary.length - 1) setCurrentDayIndex(currentDayIndex + 1) };
  const previousDay = () => { if (currentDayIndex > 0) setCurrentDayIndex(currentDayIndex - 1) };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setDays('');
      setDaysError(false);
      return;
    }

    const numericValue = Number(value);
    setDays(numericValue);

    if (numericValue < 1 || numericValue > 10) {
      setDaysError(true);
    } else {
      setDaysError(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen px-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">AI Travel Itinerary Planner</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Interests (comma separated)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Days (2-10)"
              value={days}
              onChange={handleDaysChange}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${daysError ? 'border-red-500' : 'border-gray-300'}`}
              required
              min="1"
              max="10"
            />
            {daysError && <p className="text-sm text-red-500">Please enter a valid number of days (between 1-10)</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            disabled={daysError}
          >
            Generate Itinerary
          </button>
        </form>

        {loading && (
          <div className="flex justify-center items-center mt-6">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && itinerary.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800">{itinerary[currentDayIndex]?.title}</h2>
              {itinerary[currentDayIndex]?.sections?.map((section, index) => {
                const isTimeOfDay = /^(Morning|Afternoon|Evening|Night):/.test(section);

                return (
                  <div key={index} className="mt-4">
                    {isTimeOfDay ? (
                      <h3 className="text-lg font-semibold text-indigo-600">{section}</h3>
                    ) : (
                      <p className="text-sm text-gray-700">{section}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                onClick={previousDay}
                className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
                disabled={currentDayIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={nextDay}
                className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
                disabled={currentDayIndex === itinerary.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
