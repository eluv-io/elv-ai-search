import React from "react";

const ApproveIcon = React.forwardRef(({...props}, ref) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
      <path d="M23 12L20.56 9.22004L20.9 5.54004L17.29 4.72004L15.4 1.54004L12 3.00004L8.6 1.54004L6.71 4.72004L3.1 5.53004L3.44 9.21004L1 12L3.44 14.78L3.1 18.47L6.71 19.29L8.6 22.47L12 21L15.4 22.46L17.29 19.28L20.9 18.46L20.56 14.78L23 12ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58004L18 9.00004L10 17Z" fill="black" fillOpacity="0.16"/>
    </svg>
  );
});

export default ApproveIcon;
