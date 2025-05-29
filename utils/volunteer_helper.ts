// Returns the profile if is_volunteer is true, otherwise null
export function getVolunteerProfile(profile: any) {
  if (profile && profile.is_volunteer) {
    return profile;
  }
  return null;
}