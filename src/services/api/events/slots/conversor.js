export function convertEventChairs(chairs, track = undefined) {
  return chairs
    .filter((c) => !track || c.tracks.includes(track))
    .map(convertEventChair)
}

export function convertEventChairsByTracks(chairs) {
  return chairs.flatMap(({ user, tracks }) =>
    tracks.map((track) => ({ track, mail: user.email }))
  )
}

export function convertEventChair(data) {
  return {
    userId: data.user_id,
    email: data.user.email,
    fullname: data.user.name + ' ' + data.user.lastname,
    tracks: data.tracks,
  }
}
