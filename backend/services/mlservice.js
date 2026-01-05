import axios from "axios";

export const analyzeGaps = async (payload) => {
  const response = await axios.post(
    `${process.env.ML_SERVICE_URL}/analyze`,
    payload
  );
  return response.data;
};
