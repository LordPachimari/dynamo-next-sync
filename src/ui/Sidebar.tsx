import { Button } from "./Button";
import { Switch } from "./Switch";

export default function Sidebar({
  showSidebar,
  toggleShowSidebar,
}: {
  showSidebar: boolean;
  toggleShowSidebar: () => void;
}) {
  return (
    <div className={`sidebar ${showSidebar ? "show" : ""}`}>
      <div className="flex items-center justify-between p-2">
        <Switch className="bg-blue-500 " />
        <Button
          className="bg-orange-100 hover:bg-orange-200"
          onClick={() => toggleShowSidebar()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"
              fill="var(--orange)"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
