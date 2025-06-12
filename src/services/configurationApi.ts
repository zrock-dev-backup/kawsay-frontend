import { API_BASE_URL, handleResponse } from "./api.helpers.ts";
import type { ClassTypeConfigurationDto } from "../interfaces/configurationDtos.ts";

const CONFIG_URL = `${API_BASE_URL}/configuration`;

export const getClassTypeDefaults = async (): Promise<
  ClassTypeConfigurationDto[]
> => {
  const response = await fetch(`${CONFIG_URL}/class-type-defaults`);
  return handleResponse<ClassTypeConfigurationDto[]>(response);
};
