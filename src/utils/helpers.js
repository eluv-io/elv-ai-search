export const FormatTime = ({
  time,
  millisecondsFormat=true,
  format="hh:mm:ss"
}) => {
  if(time === undefined) { return ""; }

  let date = new Date(millisecondsFormat ? time : (time * 1000));
  let timeString, hours, minutes, seconds;

  if(time === 0) {
    hours = 0;
    minutes = 0;
    seconds = 0;
  } else {
    hours = date.getUTCHours();
    minutes = date.getUTCMinutes();
    seconds = date.getUTCSeconds();
  }

  if(format === "hh:mm:ss") {
    const arrayValue = [
      (hours).toString().padStart(2, "0"),
      (minutes).toString().padStart(2, "0"),
      (seconds).toString().padStart(2, "0"),
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
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.ceil(duration / 1000);

    return minutes === 0 ?
      Pluralize({baseWord: "second", count: seconds}) :
      Pluralize({baseWord: "minute", count: minutes});
  } else {
    return duration;
  }
};

export const FormatRuntime = ({timeMins}) => {
  const hours = Math.floor(timeMins / 60);
  const minutes = timeMins % 60;

  return `${hours}h ${minutes}m`;
};

// Format kebab-/snake-case name
export const FormatName = (name) => {
  return (name || "")
    .replace("-", " ")
    .split(/[_, \s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const TimeInterval = ({startTime, endTime}) => {
  const startTimeFormatted = FormatTime({time: startTime});
  const endTimeFormatted = FormatTime({time: endTime});
  const duration = FormatDuration({startTime, endTime});

  return `${startTimeFormatted} - ${endTimeFormatted} (${duration})`;
};

export const Pluralize = ({baseWord, suffix="s", count}) => {
  if(count === undefined) { return `No ${baseWord}${suffix}`; }

  return `${count} ${count === 1 ? baseWord : `${baseWord}${suffix}`}`;
};

export const ToTitleCase = ({text}) => {
  return text.replace(
    /\w\S*/g,
    string => string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
  );
};

export const ScaleImage = ({url, width, height}) => {
  try {
    url = new URL(url);

    if(width) {
      url.searchParams.set("width", width);
    } else {
      url.searchParams.set("height", height);
    }

    return url.toString();
  } catch(error) {
    return url;
  }
};

export const SplitCamelCase = ({string}) => {
  return string
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const HandleDownload = ({downloadLink, name}) => {
  const link = document.createElement("a");
  link.href = downloadLink;

  if(name) {
    link.setAttribute("download", name);
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
