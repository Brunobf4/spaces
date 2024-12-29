import {
  FormHandler,
  ListUsersHandler,
  SearchUserHandler,
} from "./handlers.js";
import createToast from "./toast.js";

// Cria instâncias das classes de tratamento
const formHandler = new FormHandler("new-user-form");
const listUsersHandler = new ListUsersHandler("list-users", "user-list");
const searchUserHandler = new SearchUserHandler(
  "search-button",
  "search-email",
  "user-list"
);
