export async function fetchActivities(accessToken) {
  const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activities from Strava');
  }

  const data = await response.json();

  // Filter for runs and map to required fields
  const runData = data
    .filter(activity => activity.type === 'Run')
    .map(activity => ({
      name: activity.name,
      distance: activity.distance,
      duration: activity.moving_time,
    }));

  return runData[0];
}