// src/mocks/predictionHandlers.ts
import { http, HttpResponse, delay } from "msw";
import { API_BASE_URL } from "../services/api.helpers";
import type {
  StudentGradeInputDto,
  StudentPredictionDto,
} from "../interfaces/predictionDtos";

const PREDICTION_URL = `${API_BASE_URL}/predictions`;

export const predictionHandlers = [
  http.post(`${PREDICTION_URL}/batch`, async ({ request }) => {
    const body = (await request.json()) as StudentGradeInputDto[];
    
    // Simulamos tiempo de proceso del modelo de ML
    await delay(1200);

    const predictions: StudentPredictionDto[] = body.map((input) => {
      // CASO 1: Lucas Silva (ID 1099) -> ÉXITO (Verde)
      if (input.studentId === 1099) {
        return {
          studentId: 1099,
          courseId: input.courseId,
          semester: input.semester,
          predictedOutcome: "PASS",
          confidence: 0.96, // 96% -> Se verá Verde
          drivers: [
            "Historical GPA trend is positive",
            "Strong performance in prerequisites"
          ],
        };
      }

      // CASO 2: Peter Jones (ID 1002) -> RIESGO (Rojo)
      if (input.studentId === 1002) {
        return {
          studentId: 1002,
          courseId: input.courseId,
          semester: input.semester,
          predictedOutcome: "FAIL",
          confidence: 0.88, // 88% probabilidad de fallo -> Se verá Rojo
          drivers: [
            "Repeated failure in Math module",
            "Low attendance rate"
          ],
        };
      }

      // CASO 3: Emily White (ID 1025) -> INCIERTO (Amarillo)
      // Es PASS, pero con baja confianza (< 70%)
      if (input.studentId === 1025) {
        return {
          studentId: 1025,
          courseId: input.courseId,
          semester: input.semester,
          predictedOutcome: "PASS",
          confidence: 0.65, // 65% -> Se verá Amarillo
          drivers: [
            "Inconsistent lab results",
            "Exam scores trending down"
          ],
        };
      }

      // Fallback genérico
      return {
        studentId: input.studentId,
        courseId: input.courseId,
        semester: input.semester,
        predictedOutcome: "PASS",
        confidence: 0.5,
        drivers: ["Insufficient data"],
      };
    });

    return HttpResponse.json(predictions);
  }),
];