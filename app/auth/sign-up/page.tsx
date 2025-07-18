import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 pt-20">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
