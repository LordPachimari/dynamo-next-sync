import { Button } from "~/ui/Button";

export default function Actions() {
  return (
    <div className="mt-16 flex w-full flex-col gap-5 lg:w-80 ">
      <Button className="bg-orange-400 hover:bg-orange-500">
        Create quest
      </Button>
      <Button className="bg-orange-400 hover:bg-orange-500">
        Create solution
      </Button>
    </div>
  );
}
