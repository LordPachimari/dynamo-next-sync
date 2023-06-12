dayjs.extend(RelativeTime.default);
import dayjs from "dayjs";
import * as RelativeTime from "dayjs/plugin/relativeTime";
export const FromNow = ({ date }: { date: string }) => {
  return dayjs(date).fromNow();
};
