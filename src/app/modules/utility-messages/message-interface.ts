
export enum IssueType {
  GENERAL = "general",
  SUPPORT = "support",
  BILLING = "billing",
  PARTNERSHIP = "partnership",
}



export interface IMessage {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  issueType: IssueType;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}
