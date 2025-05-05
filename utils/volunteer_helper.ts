// Returns the profile if is_volunteer is true, otherwise null
export function getVolunteerProfile(profile: any) {
  if (profile && profile.is_volunteer) {
    return profile;
  }
  return null;
}

// Returns true if the profile is a volunteer
export function isVolunteer(profile: any): boolean {
  return !!(profile && profile.is_volunteer);
}
