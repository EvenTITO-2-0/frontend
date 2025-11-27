export function convertWorksForOrganizer(works) {
  return works.map(convertWorkForOrganizer)
}

function convertWorkForOrganizer(work) {
  return {
    id: work.id,
    track: work.track,
    title: work.title,
    state: work.state,
    talk: work.talk,
    speaker: work.authors.filter((author) => author.is_speaker),
    authors: work.authors,
    room_name: work.room_name,
    start_date: work.start_date,
    end_date: work.end_date,
  }
}
