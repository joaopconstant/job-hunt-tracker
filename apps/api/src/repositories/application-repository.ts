import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../schemas.js";

export interface ApplicationRepository {
  list(filter?: { status?: ApplicationStatus }): Promise<Application[]>;
  findById(id: string): Promise<Application | null>;
  create(input: CreateApplicationInput): Promise<Application>;
  /** Returns null when the application does not exist. */
  update(id: string, input: UpdateApplicationInput): Promise<Application | null>;
  /** Returns false when the application does not exist. */
  delete(id: string): Promise<boolean>;
}
