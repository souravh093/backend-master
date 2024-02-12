import vine from "@vinejs/vine";
import { customErrorReporter } from "./customErrorReporter.js";

// * custom Error Reporter
vine.errorReporter = () => new customErrorReporter();

// * register validation
export const registerSchema = vine.object({
  name: vine.string().minLength(2).maxLength(199),
  email: vine.string().email(),
  password: vine.string().minLength(8).maxLength(32).confirmed(),
});

// * login validation
export const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(8).maxLength(32),
});
