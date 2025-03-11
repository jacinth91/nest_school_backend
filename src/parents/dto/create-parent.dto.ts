export class CreateParentDto {
  parentName: string;
  email: string;
  phone: string;
  address: string;
  studentUsids: string[]; // Array of student USIDs to associate with the parent
} 