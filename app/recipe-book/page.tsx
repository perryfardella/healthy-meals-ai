import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { RecipeGenerator } from "@/components/RecipeGenerator";
import { createClient } from "@/lib/supabase/server";

export default async function RecipeBookPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recipe Book
            </h1>
            <p className="text-gray-600">
              Generate personalized, high-protein recipes using your available
              ingredients.
            </p>
          </div>
          <LogoutButton />
        </div>

        <RecipeGenerator />
      </div>
    </div>
  );
}
