import { createFileRoute } from "@tanstack/react-router";
import { AppRouter } from "@/App";

export const Route = createFileRoute("/$")({
  component: AppRouter,
});