import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { vi } from "date-fns/locale";

export function calTime(time: Timestamp) {
  const date = new Date(time.seconds * 1000 + time.nanoseconds / 1000000);
  const result = formatDistanceToNow(date, { addSuffix: true, locale: vi });

  if (result === "dưới 1 phút trước") {
    return "Vừa mới đây";
  }

  return result;
}
