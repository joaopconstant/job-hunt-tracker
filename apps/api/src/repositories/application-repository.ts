import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../schemas.js";

/** Every method is scoped to one user: another user's applications behave as if they don't exist. */
export interface ApplicationRepository {
  list(userId: string, filter?: { status?: ApplicationStatus }): Promise<Application[]>;
  findById(userId: string, id: string): Promise<Application | null>;
  create(userId: string, input: CreateApplicationInput): Promise<Application>;
  /** Returns null when the application does not exist. */
  update(userId: string, id: string, input: UpdateApplicationInput): Promise<Application | null>;
  /** Returns false when the application does not exist. */
  delete(userId: string, id: string): Promise<boolean>;
}
