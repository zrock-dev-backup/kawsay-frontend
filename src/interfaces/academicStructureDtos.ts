import type {StudentDto,} from './apiDataTypes.ts';

export interface CreateCohortRequest {
    name: string;
    timetableId: number;
}

export interface CreateStudentGroupRequest {
    name: string;
    cohortId: number;
}

export interface CreateSectionRequest {
    name: string;
    studentGroupId: number;
}

export interface AssignStudentToSectionRequest {
    studentId: number;
    sectionId: number;
}

export interface SectionDetailDto {
    id: number;
    name: string;
    students: StudentDto[];
}

export interface StudentGroupDetailDto {
    id: number;
    name: string;
    sections: SectionDetailDto[];
}

export interface CohortDetailDto {
    id: number;
    name: string;
    timetableId: number;
    studentGroups: StudentGroupDetailDto[];
}
