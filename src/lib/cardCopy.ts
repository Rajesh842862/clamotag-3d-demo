import type { Employee } from "./types.ts";

export interface CardCopy {
  front: string[];
  back: string[];
}

/**
 * Text printed on the physical card. Deliberately excludes personal details
 * such as date of birth, blood group, phone numbers and addresses.
 */
export function getCardCopy(employee: Employee): CardCopy {
  return {
    front: [
      "CLAMOTAG",
      "EMPLOYEE ACCESS",
      "CARDHOLDER",
      employee.name,
      employee.department.toUpperCase(),
      "EMPLOYEE ID",
      employee.id,
      "CONTACTLESS · 13.56 MHZ",
    ],
    back: [
      "CLAMOTAG",
      "RFID ACCESS CARD",
      "CONTACTLESS ACCESS",
      "13.56 MHZ · ISO/IEC 14443-A",
      "PRESENT CARD TO READER",
      "PROPERTY OF CLAMOTAG",
      "UNAUTHORIZED USE IS PROHIBITED",
    ],
  };
}
