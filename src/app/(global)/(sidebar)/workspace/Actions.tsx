import { Button } from "~/ui/Button";

export default function Actions() {
  return (
    <div className="mt-16 flex w-full flex-col gap-5 lg:w-80 ">
      <Button className="max-w-lg bg-blue-400 hover:bg-blue-500">
        Create quest
      </Button>
      <Button className="max-w-lg bg-blue-400 hover:bg-blue-500">
        Create solution
      </Button>
    </div>
  );
}
