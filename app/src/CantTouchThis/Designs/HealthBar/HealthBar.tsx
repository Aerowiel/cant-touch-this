import { FaHeart, FaRegHeart } from "react-icons/fa6/index.js";

const HealthBar = ({ health, maxHealth }) => {
  return (
    <div className="health-bar">
      {[...Array(maxHealth)].map((_, i) => {
        const value = i + 1;
        return (
          <div key={`heart-${value}`} className="health-bar__heart">
            {health >= value ? <FaHeart /> : <FaRegHeart />}
          </div>
        );
      })}
    </div>
  );
};

export default HealthBar;
