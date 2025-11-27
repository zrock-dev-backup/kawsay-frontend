// services/predictionApi.ts
import { API_BASE_URL, apiRequest } from "./api.helpers";
import type {
  StudentGradeInputDto,
  StudentPredictionDto,
} from "../interfaces/predictionDtos";

const PREDICTION_URL = `${API_BASE_URL}/predictions`;

export const fetchBatchPredictions = async (
  inputs: StudentGradeInputDto[]
): Promise<StudentPredictionDto[]> => {
  return apiRequest<StudentPredictionDto[]>(`${PREDICTION_URL}/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(inputs),
  });
};
