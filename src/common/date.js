export function useDate() {
  function convertDate(date) {
    const offset = new Date().getTimezoneOffset();
    const datetime = new Date(date);
    datetime.setMinutes(datetime.getMinutes() - offset);
    return datetime.toISOString().replace('T', ' ').substr(0, 19);
  }
  return { convertDate }
}