import { IOtp } from "./otp.interface";

export interface IOtpRepository {
  create(email: string): Promise<IOtp>;
  submit(email: string, otp: number): Promise<IOtp | null>;
}
