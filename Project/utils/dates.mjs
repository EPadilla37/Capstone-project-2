const formatDate = {
  formatFullDate(date, lang = "es-ES") {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const result = date.toLocaleDateString(lang, options);
    return result;
  },
  formatShortDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day} / ${month} / ${year}`;
  },
  formatDoB(date_DoB) {
    const date = new Date();
    const dob = new Date(date_DoB);

    const difMs = date - dob;

    const age = Math.floor(difMs / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  },

  addMinutesToTime(time, minutesToAdd) {
    //console.log(`addMinutesToTime(${time}, ${minutesToAdd})`);
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    const newTotalMinutes = hours * 60 + minutes + parseInt(minutesToAdd);

    const newHours = Math.floor(newTotalMinutes / 60);
    const newMinutes = newTotalMinutes % 60;

    const newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;

    return newTime;
  },

  getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  },

  getCurrentDateTime() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const hours = today.getHours().toString().padStart(2, "0");
    const minutes = today.getMinutes().toString().padStart(2, "0");
    const seconds = today.getSeconds().toString().padStart(2, "0");

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
  },
};

export { formatDate };
