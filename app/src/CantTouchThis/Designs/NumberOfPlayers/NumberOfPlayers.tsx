import { FaSquareFull } from "react-icons/fa/index.js";

const NumberOfPlayers = ({ numberOfPlayers }) => {
  return (
    <div className="number-of-players">
      <div className="number-of-players__value">{numberOfPlayers}</div>
      <FaSquareFull />
    </div>
  );
};

export default NumberOfPlayers;
