import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // Redirect to recipe-book instead
  redirect("/recipe-book");
}
