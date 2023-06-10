import { Button } from "~/components/Button";

export default function Actions() {
  return (
    <div className="mt-16 flex w-full flex-col gap-5 lg:w-80 ">
      <Button className="bg-green-500 hover:bg-green-600">Create quest</Button>
      <Button className="bg-yellow-300 text-black hover:bg-yellow-400">
        Create solution
      </Button>
    </div>
  );
}
