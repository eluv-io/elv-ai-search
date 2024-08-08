export const FormatTime = ({
  time,
  millisecondsFormat=true,
  format="hh:mm:ss"
}) => {
  if(!time) { return ""; }

  let date = new Date(millisecondsFormat ? time : (time * 1000));
  let timeString;

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = (date.getUTCMilliseconds() / 10) | 0;

  if(format === "hh:mm:ss") {
    const arrayValue = [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
      milliseconds.toString().padStart(2, "0")
    ];

    timeString = arrayValue.join(":");
  } else if(format === "mm") {
    return `${minutes.toString()} minutes`;
  } else if(format === "mm, ss") {
    return `${minutes.toString()} minutes ${seconds.toString()}`;
  } else {
    // eslint-disable-next-line no-console
    console.error(`Unsupported format${format}`);
  }

  return timeString;
};

export const FormatDuration = ({
  startTime,
  endTime,
  milliseconds=true,
  formatted=true
}) => {
  if(!milliseconds) {
    startTime = startTime * 1000;
    endTime = endTime * 1000;
  }

  const duration = endTime - startTime;

  if(formatted) {
    const minutes = Math.floor((duration % 3600) / 60).toString();
    // const seconds = Math.floor(duration % 60).toString();

    return `${minutes} ${minutes > 1 ? "minutes" : "minute"}`;
  } else {
    return duration;
  }
};
