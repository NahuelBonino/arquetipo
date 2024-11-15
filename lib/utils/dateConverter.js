import Moment from "react-moment";

const localTime = (date) => {
  if (date) {
    return (
      <Moment format="DD/MM/yyyy HH:mm" utc local>
        {date}
      </Moment>
    );
  }
  return null;
};

export default localTime;
