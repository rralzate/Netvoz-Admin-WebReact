import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";

const handlers = [mockTokenExpired, menuList];
const worker = setupWorker(...handlers);

export { worker };
